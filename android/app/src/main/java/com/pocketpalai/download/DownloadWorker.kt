package com.pocketpal.download

import android.content.Context
import android.util.Log
import androidx.work.*
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.*
import java.io.File
import java.io.IOException
import kotlin.coroutines.resume
import kotlin.coroutines.resumeWithException
import kotlin.coroutines.suspendCoroutine

class DownloadWorker(
    context: Context,
    params: WorkerParameters
) : CoroutineWorker(context, params) {

    private val downloadDao = DownloadDatabase.getInstance(context).downloadDao()
    private val client = OkHttpClient.Builder()
        .addInterceptor(ProgressInterceptor())
        .build()

    override suspend fun doWork(): Result = withContext(Dispatchers.IO) {
        try {
            val downloadId = inputData.getString(KEY_DOWNLOAD_ID) ?: return@withContext Result.failure()
            val download = downloadDao.getDownload(downloadId) ?: return@withContext Result.failure()

            if (download.isPaused) {
                return@withContext Result.retry()
            }

            val file = File(download.destination)
            val request = Request.Builder()
                .url(download.url)
                .apply {
                    if (file.exists() && file.length() > 0) {
                        addHeader("Range", "bytes=${file.length()}-")
                    }
                }
                .build()

            downloadDao.updateStatus(downloadId, DownloadStatus.RUNNING)

            val response = suspendCoroutine { continuation ->
                client.newCall(request).enqueue(object : Callback {
                    override fun onFailure(call: Call, e: IOException) {
                        continuation.resumeWithException(e)
                    }

                    override fun onResponse(call: Call, response: Response) {
                        continuation.resume(response)
                    }
                })
            }

            if (!response.isSuccessful) {
                throw IOException("Unexpected response: ${response.code}")
            }

            response.body?.let { body ->
                val contentLength = body.contentLength()
                var bytesWritten = if (file.exists()) file.length() else 0

                file.outputStream().buffered().use { output ->
                    body.byteStream().buffered().use { input ->
                        val buffer = ByteArray(DEFAULT_BUFFER_SIZE)
                        var bytes = input.read(buffer)
                        
                        while (bytes >= 0 && !isStopped) {
                            if (downloadDao.getDownload(downloadId)?.isPaused == true) {
                                return@withContext Result.retry()
                            }

                            output.write(buffer, 0, bytes)
                            bytesWritten += bytes
                            
                            setProgress(workDataOf(
                                KEY_PROGRESS to bytesWritten,
                                KEY_TOTAL to contentLength
                            ))

                            downloadDao.updateProgress(downloadId, bytesWritten, DownloadStatus.RUNNING)
                            bytes = input.read(buffer)
                        }
                    }
                }

                downloadDao.updateStatus(downloadId, DownloadStatus.COMPLETED)
                return@withContext Result.success()
            }

            return@withContext Result.failure()
        } catch (e: Exception) {
            Log.e(TAG, "Download failed", e)
            val downloadId = inputData.getString(KEY_DOWNLOAD_ID)
            downloadId?.let {
                downloadDao.updateStatus(it, DownloadStatus.FAILED, e.message)
            }
            return@withContext Result.failure()
        }
    }

    companion object {
        private const val TAG = "DownloadWorker"
        const val KEY_DOWNLOAD_ID = "download_id"
        const val KEY_PROGRESS = "progress"
        const val KEY_TOTAL = "total"

        fun createWorkRequest(downloadId: String): OneTimeWorkRequest {
            val constraints = Constraints.Builder()
                .setRequiredNetworkType(androidx.work.NetworkType.CONNECTED)
                .build()

            return OneTimeWorkRequestBuilder<DownloadWorker>()
                .setConstraints(constraints)
                .setInputData(workDataOf(KEY_DOWNLOAD_ID to downloadId))
                .setBackoffCriteria(
                    BackoffPolicy.EXPONENTIAL,
                    WorkRequest.MIN_BACKOFF_MILLIS,
                    java.util.concurrent.TimeUnit.MILLISECONDS
                )
                .build()
        }
    }
}

class ProgressInterceptor : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        val originalResponse = chain.proceed(chain.request())
        return originalResponse.newBuilder()
            .body(originalResponse.body?.let { ProgressResponseBody(it) })
            .build()
    }
} 