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
    private var lastProgressUpdate = 0L

    init {
        Log.d(TAG, "Initializing DownloadWorker")
    }

    override suspend fun doWork(): Result = withContext(Dispatchers.IO) {
        try {
            val downloadId = inputData.getString(KEY_DOWNLOAD_ID) ?: return@withContext Result.failure()
            Log.d(TAG, "Starting download work for ID: $downloadId")

            val progressInterval = inputData.getLong(KEY_PROGRESS_INTERVAL, DEFAULT_PROGRESS_INTERVAL)
            Log.d(TAG, "Progress update interval: $progressInterval ms")

            val download = downloadDao.getDownload(downloadId) ?: return@withContext Result.failure()
            Log.d(TAG, "Retrieved download info: $download")

            if (download.isPaused) {
                Log.d(TAG, "Download is paused, returning retry for ID: $downloadId")
                return@withContext Result.retry()
            }

            val file = File(download.destination)
            Log.d(TAG, "Download destination: ${file.absolutePath}")
            
            val request = Request.Builder()
                .url(download.url)
                .apply {
                    if (file.exists() && file.length() > 0) {
                        val range = "bytes=${file.length()}-"
                        Log.d(TAG, "Resuming download from byte ${file.length()}")
                        addHeader("Range", range)
                    }
                }
                .build()

            Log.d(TAG, "Updating status to RUNNING for ID: $downloadId")
            downloadDao.updateStatus(downloadId, DownloadStatus.RUNNING)

            Log.d(TAG, "Executing network request for ID: $downloadId")
            val response = suspendCoroutine { continuation ->
                client.newCall(request).enqueue(object : Callback {
                    override fun onFailure(call: Call, e: IOException) {
                        Log.e(TAG, "Network request failed for ID: $downloadId", e)
                        continuation.resumeWithException(e)
                    }

                    override fun onResponse(call: Call, response: Response) {
                        Log.d(TAG, "Received response for ID: $downloadId, code: ${response.code}")
                        continuation.resume(response)
                    }
                })
            }

            if (!response.isSuccessful) {
                val error = "Unexpected response: ${response.code}"
                Log.e(TAG, error)
                throw IOException(error)
            }

            response.body?.let { body ->
                val contentLength = body.contentLength()
                Log.d(TAG, "Content length: $contentLength bytes for ID: $downloadId")
                var bytesWritten = if (file.exists()) file.length() else 0
                Log.d(TAG, "Starting from $bytesWritten bytes for ID: $downloadId")

                file.outputStream().buffered().use { output ->
                    body.byteStream().buffered().use { input ->
                        val buffer = ByteArray(DEFAULT_BUFFER_SIZE)
                        var bytes = input.read(buffer)
                        
                        while (bytes >= 0 && !isStopped) {
                            val currentDownload = downloadDao.getDownload(downloadId)
                            if (currentDownload?.isPaused == true) {
                                Log.d(TAG, "Download paused during transfer for ID: $downloadId")
                                return@withContext Result.retry()
                            }

                            if (isStopped) {
                                Log.d(TAG, "Download cancelled during transfer for ID: $downloadId")
                                downloadDao.updateStatus(downloadId, DownloadStatus.FAILED, "Download cancelled")
                                return@withContext Result.failure()
                            }

                            output.write(buffer, 0, bytes)
                            bytesWritten += bytes

                            val currentTime = System.currentTimeMillis()
                            if (currentTime - lastProgressUpdate >= progressInterval) {
                                val progress = workDataOf(
                                    KEY_PROGRESS to bytesWritten,
                                    KEY_TOTAL to contentLength
                                )
                                Log.d(TAG, "Progress: $bytesWritten/$contentLength bytes for ID: $downloadId")
                                setProgress(progress)
                                downloadDao.updateProgress(downloadId, bytesWritten, DownloadStatus.RUNNING)
                                lastProgressUpdate = currentTime
                            }
                            
                            bytes = input.read(buffer)
                        }
                    }
                }

                Log.d(TAG, "Download completed successfully for ID: $downloadId")
                downloadDao.updateStatus(downloadId, DownloadStatus.COMPLETED)
                return@withContext Result.success()
            }

            Log.e(TAG, "No response body for ID: $downloadId")
            return@withContext Result.failure()
        } catch (e: Exception) {
            Log.e(TAG, "Download failed", e)
            val downloadId = inputData.getString(KEY_DOWNLOAD_ID)
            downloadId?.let {
                Log.e(TAG, "Updating status to FAILED for ID: $it")
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
        const val KEY_PROGRESS_INTERVAL = "progress_interval"
        const val DEFAULT_PROGRESS_INTERVAL = 1000L // 1 second default

        fun createWorkRequest(downloadId: String, progressInterval: Long = DEFAULT_PROGRESS_INTERVAL): OneTimeWorkRequest {
            Log.d(TAG, "Creating work request for download ID: $downloadId with progress interval: $progressInterval ms")
            val constraints = Constraints.Builder()
                .setRequiredNetworkType(androidx.work.NetworkType.CONNECTED)
                .build()

            return OneTimeWorkRequestBuilder<DownloadWorker>()
                .setConstraints(constraints)
                .setInputData(workDataOf(
                    KEY_DOWNLOAD_ID to downloadId,
                    KEY_PROGRESS_INTERVAL to progressInterval
                ))
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