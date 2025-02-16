package com.pocketpal.download

import android.util.Log
import androidx.work.WorkInfo
import androidx.work.WorkManager
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.first
import java.util.*

class DownloadModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Main.immediate)
    private val downloadDao = DownloadDatabase.getInstance(reactContext).downloadDao()
    private val workManager = WorkManager.getInstance(reactContext)

    override fun getName() = "DownloadModule"

    @ReactMethod
    fun addListener(eventName: String) {
        // Keep: Required for React Native event emitter
    }

    @ReactMethod
    fun removeListeners(count: Int) {
        // Keep: Required for React Native event emitter
    }

    private fun sendEvent(eventName: String, params: WritableMap) {
        reactApplicationContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(eventName, params)
    }

    @ReactMethod
    fun startDownload(url: String, config: ReadableMap, promise: Promise) {
        scope.launch {
            try {
                val downloadId = UUID.randomUUID().toString()
                val destination = config.getString("destination")
                    ?: throw IllegalArgumentException("Destination path is required")

                val networkType = when (config.getString("networkType")) {
                    "WIFI" -> NetworkType.WIFI
                    else -> NetworkType.ANY
                }

                val download = DownloadEntity(
                    id = downloadId,
                    url = url,
                    destination = destination,
                    totalBytes = 0,
                    downloadedBytes = 0,
                    status = DownloadStatus.QUEUED,
                    priority = config.getInt("priority") ?: 0,
                    networkType = networkType,
                    createdAt = System.currentTimeMillis()
                )

                withContext(Dispatchers.IO) {
                    downloadDao.insertDownload(download)
                }

                val workRequest = DownloadWorker.createWorkRequest(downloadId)
                workManager.enqueue(workRequest)

                workManager.getWorkInfoByIdLiveData(workRequest.id)
                    .observeForever { workInfo ->
                        when (workInfo.state) {
                            WorkInfo.State.RUNNING -> {
                                val progress = workInfo.progress.getLong(DownloadWorker.KEY_PROGRESS, 0)
                                val total = workInfo.progress.getLong(DownloadWorker.KEY_TOTAL, 0)
                                sendProgressEvent(downloadId, progress, total)
                            }
                            WorkInfo.State.SUCCEEDED -> {
                                scope.launch {
                                    val downloadInfo = downloadDao.getDownload(downloadId)
                                    if (downloadInfo != null) {
                                        sendCompletionEvent(downloadId, downloadInfo.destination)
                                    }
                                }
                            }
                            WorkInfo.State.FAILED -> {
                                scope.launch {
                                    val downloadInfo = downloadDao.getDownload(downloadId)
                                    if (downloadInfo != null) {
                                        sendFailureEvent(downloadId, downloadInfo.error ?: "Unknown error")
                                    }
                                }
                            }
                            else -> {}
                        }
                    }

                val response = Arguments.createMap().apply {
                    putString("downloadId", downloadId)
                }
                promise.resolve(response)
            } catch (e: Exception) {
                Log.e(TAG, "Failed to start download", e)
                promise.reject("DOWNLOAD_ERROR", e.message)
            }
        }
    }

    @ReactMethod
    fun getActiveDownloads(promise: Promise) {
        scope.launch {
            try {
                val downloads = withContext(Dispatchers.IO) {
                    downloadDao.getAllDownloads().first()
                        .filter { it.status != DownloadStatus.COMPLETED }
                }

                val result = Arguments.createArray()
                downloads.forEach { download ->
                    result.pushMap(Arguments.createMap().apply {
                        putString("id", download.id)
                        putString("url", download.url)
                        putString("destination", download.destination)
                        putDouble("progress", 
                            if (download.totalBytes > 0) 
                                (download.downloadedBytes.toDouble() / download.totalBytes.toDouble()) * 100 
                            else 0.0
                        )
                        putString("status", download.status.name)
                    })
                }
                promise.resolve(result)
            } catch (e: Exception) {
                promise.reject("FETCH_ERROR", e.message)
            }
        }
    }

    @ReactMethod
    fun pauseDownload(downloadId: String, promise: Promise) {
        scope.launch {
            try {
                withContext(Dispatchers.IO) {
                    downloadDao.updatePauseStatus(downloadId, true)
                }
                workManager.cancelUniqueWork(downloadId)
                promise.resolve(true)
            } catch (e: Exception) {
                promise.reject("PAUSE_ERROR", e.message)
            }
        }
    }

    @ReactMethod
    fun resumeDownload(downloadId: String, promise: Promise) {
        scope.launch {
            try {
                withContext(Dispatchers.IO) {
                    downloadDao.updatePauseStatus(downloadId, false)
                    val download = downloadDao.getDownload(downloadId)
                    if (download != null) {
                        val workRequest = DownloadWorker.createWorkRequest(downloadId)
                        workManager.enqueue(workRequest)
                    }
                }
                promise.resolve(true)
            } catch (e: Exception) {
                promise.reject("RESUME_ERROR", e.message)
            }
        }
    }

    @ReactMethod
    fun retryDownload(downloadId: String, promise: Promise) {
        scope.launch {
            try {
                withContext(Dispatchers.IO) {
                    val download = downloadDao.getDownload(downloadId)
                    if (download != null) {
                        downloadDao.updateStatus(downloadId, DownloadStatus.QUEUED)
                        val workRequest = DownloadWorker.createWorkRequest(downloadId)
                        workManager.enqueue(workRequest)
                    }
                }
                promise.resolve(true)
            } catch (e: Exception) {
                promise.reject("RETRY_ERROR", e.message)
            }
        }
    }

    private fun sendProgressEvent(downloadId: String, bytesWritten: Long, totalBytes: Long) {
        val params = Arguments.createMap().apply {
            putString("downloadId", downloadId)
            putDouble("bytesWritten", bytesWritten.toDouble())
            putDouble("totalBytes", totalBytes.toDouble())
            putDouble("progress", if (totalBytes > 0) (bytesWritten.toDouble() / totalBytes.toDouble()) * 100 else 0.0)
        }
        sendEvent("onDownloadProgress", params)
    }

    private fun sendCompletionEvent(downloadId: String, filePath: String) {
        val params = Arguments.createMap().apply {
            putString("downloadId", downloadId)
            putString("filePath", filePath)
        }
        sendEvent("onDownloadComplete", params)
    }

    private fun sendFailureEvent(downloadId: String, error: String) {
        val params = Arguments.createMap().apply {
            putString("downloadId", downloadId)
            putString("error", error)
        }
        sendEvent("onDownloadFailed", params)
    }

    override fun onCatalystInstanceDestroy() {
        super.onCatalystInstanceDestroy()
        scope.cancel()
    }

    companion object {
        private const val TAG = "DownloadModule"
    }
} 