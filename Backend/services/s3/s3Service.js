const AWS = require('aws-sdk');

// Configure S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

/**
 * Upload a file to S3 with progress tracking
 * @param {Object} params - Upload parameters
 * @param {Buffer} params.fileBuffer - File buffer to upload
 * @param {string} params.key - S3 key (file path)
 * @param {string} params.contentType - File MIME type
 * @param {Function} params.onProgress - Optional progress callback (progress) => {}
 * @returns {Promise<Object>} Upload result with Location, Key, Bucket
 */
const uploadFile = async ({ fileBuffer, key, contentType, onProgress }) => {
  try {
    const uploadParams = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: key,
      Body: fileBuffer,
      ContentType: contentType,
    };

    const managedUpload = s3.upload(uploadParams);

    // Attach progress listener if provided
    if (onProgress && typeof onProgress === 'function') {
      managedUpload.on('httpUploadProgress', (progress) => {
        const percentCompleted = Math.round((progress.loaded * 100) / progress.total);
        onProgress({
          percentCompleted,
          loaded: progress.loaded,
          total: progress.total,
        });
      });
    }

    const result = await managedUpload.promise();
    return result;
  } catch (error) {
    console.error('S3 Upload Error:', error);
    throw new Error(`Failed to upload file to S3: ${error.message}`);
  }
};

/**
 * Download a single file from S3
 * @param {string} key - S3 key (file path)
 * @returns {Promise<Object>} S3 GetObject response with Body (stream), ContentType, etc.
 */
const downloadFile = async (key) => {
  try {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: key,
    };

    const result = await s3.getObject(params).promise();
    return result;
  } catch (error) {
    console.error('S3 Download Error:', error);
    throw new Error(`Failed to download file from S3: ${error.message}`);
  }
};

/**
 * Get a readable stream for a file from S3
 * @param {string} key - S3 key (file path)
 * @returns {ReadableStream} Stream of the file
 */
const getFileStream = (key) => {
  try {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: key,
    };

    return s3.getObject(params).createReadStream();
  } catch (error) {
    console.error('S3 Stream Error:', error);
    throw new Error(`Failed to create stream from S3: ${error.message}`);
  }
};

/**
 * List all objects in a specific S3 prefix (folder)
 * @param {string} prefix - S3 prefix (folder path)
 * @returns {Promise<Array>} Array of objects with Key, Size, LastModified, etc.
 */
const listObjects = async (prefix) => {
  try {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Prefix: prefix,
    };

    const result = await s3.listObjectsV2(params).promise();
    return result.Contents || [];
  } catch (error) {
    console.error('S3 List Objects Error:', error);
    throw new Error(`Failed to list objects from S3: ${error.message}`);
  }
};

/**
 * Delete a file from S3
 * @param {string} key - S3 key (file path)
 * @returns {Promise<Object>} Delete result
 */
const deleteFile = async (key) => {
  try {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: key,
    };

    const result = await s3.deleteObject(params).promise();
    return result;
  } catch (error) {
    console.error('S3 Delete Error:', error);
    throw new Error(`Failed to delete file from S3: ${error.message}`);
  }
};

/**
 * Check if a file exists in S3
 * @param {string} key - S3 key (file path)
 * @returns {Promise<boolean>} True if file exists, false otherwise
 */
const fileExists = async (key) => {
  try {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: key,
    };

    await s3.headObject(params).promise();
    return true;
  } catch (error) {
    if (error.code === 'NotFound') {
      return false;
    }
    console.error('S3 Head Object Error:', error);
    throw new Error(`Failed to check file existence in S3: ${error.message}`);
  }
};

module.exports = {
  s3, // Export the raw S3 instance if needed
  uploadFile,
  downloadFile,
  getFileStream,
  listObjects,
  deleteFile,
  fileExists,
};
