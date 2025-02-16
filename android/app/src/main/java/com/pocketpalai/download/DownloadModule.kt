package com.pocketpal.download

import android.util.Log
import androidx.work.WorkInfo
import androidx.work.WorkManager
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.first
import java.io.File
import java.util.*

class DownloadModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Main.immediate)
    private val downloadDao = DownloadDatabase.getInstance(reactContext).downloadDao()
    private val workManager = WorkManager.getInstance(reactContext)

    init {
        Log.d(TAG, "Initializing DownloadModule")
    }

    override fun getName() = "DownloadModule"

    @ReactMethod
    fun addListener(eventName: String) {
        Log.d(TAG, "Adding listener for event: $eventName")
    }

    @ReactMethod
    fun removeListeners(count: Int) {
        Log.d(TAG, "Removing $count listeners")
    }

    private fun sendEvent(eventName: String, params: WritableMap) {
        Log.d(TAG, "Sending event: $eventName with params: $params")
        reactApplicationContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(eventName, params)
    }

    @ReactMethod
    fun startDownload(url: String, config: ReadableMap, promise: Promise) {
        Log.d(TAG, "Starting download with config: $config")
        scope.launch {
            try {
                val downloadId = UUID.randomUUID().toString()
                Log.d(TAG, "Generated download ID: $downloadId")

                val destination = config.getString("destination")
                    ?: throw IllegalArgumentException("Destination path is required")
                Log.d(TAG, "Destination path: $destination")

                val networkType = when (config.getString("networkType")) {
                    "WIFI" -> NetworkType.WIFI
                    else -> NetworkType.ANY
                }
                Log.d(TAG, "Network type: $networkType")

                val progressInterval = config.getDouble("progressInterval")?.toLong() 
                    ?: DownloadWorker.DEFAULT_PROGRESS_INTERVAL
                Log.d(TAG, "Progress interval: $progressInterval ms")

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
                    Log.d(TAG, "Inserting download into database: $download")
                    downloadDao.insertDownload(download)
                }

                val workRequest = DownloadWorker.createWorkRequest(downloadId, progressInterval)
                Log.d(TAG, "Created work request: ${workRequest.id}")
                workManager.enqueue(workRequest)

                workManager.getWorkInfoByIdLiveData(workRequest.id)
                    .observeForever { workInfo ->
                        Log.d(TAG, "Work state changed: ${workInfo.state} for ID: $downloadId")
                        when (workInfo.state) {
                            WorkInfo.State.RUNNING -> {
                                val progress = workInfo.progress.getLong(DownloadWorker.KEY_PROGRESS, 0)
                                val total = workInfo.progress.getLong(DownloadWorker.KEY_TOTAL, 0)
                                Log.d(TAG, "Download progress: $progress/$total for ID: $downloadId")
                                sendProgressEvent(downloadId, progress, total)
                            }
                            WorkInfo.State.SUCCEEDED -> {
                                Log.d(TAG, "Download succeeded for ID: $downloadId")
                                scope.launch {
                                    val downloadInfo = downloadDao.getDownload(downloadId)
                                    if (downloadInfo != null) {
                                        Log.d(TAG, "Sending completion event for ID: $downloadId")
                                        sendCompletionEvent(downloadId, downloadInfo.destination)
                                    } else {
                                        Log.w(TAG, "Download info not found for completed download: $downloadId")
                                    }
                                }
                            }
                            WorkInfo.State.FAILED -> {
                                Log.e(TAG, "Download failed for ID: $downloadId")
                                scope.launch {
                                    val downloadInfo = downloadDao.getDownload(downloadId)
                                    if (downloadInfo != null) {
                                        Log.e(TAG, "Error details for ID $downloadId: ${downloadInfo.error}")
                                        sendFailureEvent(downloadId, downloadInfo.error ?: "Unknown error")
                                    } else {
                                        Log.w(TAG, "Download info not found for failed download: $downloadId")
                                    }
                                }
                            }
                            else -> {
                                Log.d(TAG, "Work state: ${workInfo.state} for ID: $downloadId")
                            }
                        }
                    }

                val response = Arguments.createMap().apply {
                    putString("downloadId", downloadId)
                }
                Log.d(TAG, "Resolving promise with download ID: $downloadId")
                promise.resolve(response)
            } catch (e: Exception) {
                Log.e(TAG, "Failed to start download", e)
                promise.reject("DOWNLOAD_ERROR", e.message)
            }
        }
    }

    @ReactMethod
    fun getActiveDownloads(promise: Promise) {
        Log.d(TAG, "Getting active downloads")
        scope.launch {
            try {
                val downloads = withContext(Dispatchers.IO) {
                    Log.d(TAG, "Fetching downloads from database")
                    downloadDao.getAllDownloads().first()
                        .filter { it.status != DownloadStatus.COMPLETED }
                }
                Log.d(TAG, "Found ${downloads.size} active downloads")

                val result = Arguments.createArray()
                downloads.forEach { download ->
                    Log.d(TAG, "Processing download: ${download.id}")
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
                Log.d(TAG, "Resolving promise with ${downloads.size} downloads")
                promise.resolve(result)
            } catch (e: Exception) {
                Log.e(TAG, "Failed to get active downloads", e)
                promise.reject("FETCH_ERROR", e.message)
            }
        }
    }

    @ReactMethod
    fun pauseDownload(downloadId: String, promise: Promise) {
        Log.d(TAG, "Pausing download: $downloadId")
        scope.launch {
            try {
                withContext(Dispatchers.IO) {
                    Log.d(TAG, "Updating pause status in database for: $downloadId")
                    downloadDao.updatePauseStatus(downloadId, true)
                }
                Log.d(TAG, "Cancelling work for: $downloadId")
                workManager.cancelUniqueWork(downloadId)
                promise.resolve(true)
            } catch (e: Exception) {
                Log.e(TAG, "Failed to pause download: $downloadId", e)
                promise.reject("PAUSE_ERROR", e.message)
            }
        }
    }

    @ReactMethod
    fun resumeDownload(downloadId: String, promise: Promise) {
        Log.d(TAG, "Resuming download: $downloadId")
        scope.launch {
            try {
                withContext(Dispatchers.IO) {
                    Log.d(TAG, "Updating pause status in database for: $downloadId")
                    downloadDao.updatePauseStatus(downloadId, false)
                    val download = downloadDao.getDownload(downloadId)
                    if (download != null) {
                        Log.d(TAG, "Creating new work request for: $downloadId")
                        val workRequest = DownloadWorker.createWorkRequest(downloadId)
                        workManager.enqueue(workRequest)
                    } else {
                        Log.w(TAG, "No download found to resume: $downloadId")
                    }
                }
                promise.resolve(true)
            } catch (e: Exception) {
                Log.e(TAG, "Failed to resume download: $downloadId", e)
                promise.reject("RESUME_ERROR", e.message)
            }
        }
    }

    @ReactMethod
    fun retryDownload(downloadId: String, promise: Promise) {
        Log.d(TAG, "Retrying download: $downloadId")
        scope.launch {
            try {
                withContext(Dispatchers.IO) {
                    val download = downloadDao.getDownload(downloadId)
                    if (download != null) {
                        Log.d(TAG, "Updating status to QUEUED for: $downloadId")
                        downloadDao.updateStatus(downloadId, DownloadStatus.QUEUED)
                        Log.d(TAG, "Creating new work request for: $downloadId")
                        val workRequest = DownloadWorker.createWorkRequest(downloadId)
                        workManager.enqueue(workRequest)
                    } else {
                        Log.w(TAG, "No download found to retry: $downloadId")
                    }
                }
                promise.resolve(true)
            } catch (e: Exception) {
                Log.e(TAG, "Failed to retry download: $downloadId", e)
                promise.reject("RETRY_ERROR", e.message)
            }
        }
    }

    @ReactMethod
    fun cancelDownload(downloadId: String, promise: Promise) {
        Log.d(TAG, "Cancelling download: $downloadId")
        scope.launch {
            try {
                // Cancel the work
                workManager.cancelUniqueWork(downloadId)
                
                // Update the download status in the database
                withContext(Dispatchers.IO) {
                    val download = downloadDao.getDownload(downloadId)
                    if (download != null) {
                        Log.d(TAG, "Updating status to FAILED for cancelled download: $downloadId")
                        downloadDao.updateStatus(downloadId, DownloadStatus.FAILED, "Download cancelled by user")
                        
                        // Clean up the partial download file
                        val file = File(download.destination)
                        if (file.exists()) {
                            Log.d(TAG, "Deleting partial download file: ${file.absolutePath}")
                            file.delete()
                        }
                    }
                }
                promise.resolve(true)
            } catch (e: Exception) {
                Log.e(TAG, "Failed to cancel download: $downloadId", e)
                promise.reject("CANCEL_ERROR", e.message)
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
        Log.d(TAG, "Cleaning up DownloadModule")
        super.onCatalystInstanceDestroy()
        scope.cancel()
    }

    companion object {
        private const val TAG = "DownloadModule"
    }
} 