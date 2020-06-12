const AWS = require('aws-sdk');
const fs = require('fs');
const mime = require('mime-types');

const awsCredentials = {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
};
const apiVersion = '2006-03-01';
const region = process.env.S3_ACCESS_KEY_ID || 'us-east-1';
const isUsingS3 = process.env.IS_USING_S3;
const bucketName = process.env.BUCKET_NAME;
const endpoint = 'http://tutoring-app-recordings.s3.amazonaws.com';

class AmazonController {
    constructor() {
        const credentials = new AWS.Credentials(
            awsCredentials,
        );
        this.s3 = new AWS.S3({
            apiVersion: apiVersion,
            region: region,
            credentials,
            s3BucketEndpoint: true,
            endpoint,
        });
    }

    uploadRecording(filePath, resultVideoPath) {
        return new Promise((resolve, reject) => {
            const fileStream = fs.createReadStream(filePath);
            const params = {
                Bucket: bucketName,
                Key: resultVideoPath,
                Body: fileStream,
                ContentType: 'video/webm',
            };
            this.s3.upload(params, function (err, data) {
                if (err) {
                    console.log('Error', err);
                    reject(err);
                }
                if (data) {
                    console.log('Upload Success', data.Location);
                    resolve(data.Location);
                }
            });
        });
    }

    uploadFile(filePath, data) {
        return new Promise((resolve, reject) => {
            const uploadFile = Buffer.isBuffer(data) ? data : fs.createReadStream(data);

            const params = {
                Bucket: bucketName,
                Key: filePath,
                Body: uploadFile,
                ContentType: mime.lookup(filePath),
            };
            this.s3.upload(params, function (err, data) {
                if (err) {
                    console.log('Error', err);
                    reject(err);
                }
                if (data) {
                    console.log('Upload Success', data.Location);
                    resolve(data.Location);
                }
            });
        });
    }

    remove(path) {
        return new Promise((resolve, reject) => {
            const params = { Bucket: bucketName, Key: path };

            this.s3.deleteObject(params, function (err, data) {
                if (err) {
                    console.log('Error', err);
                    reject(err);
                }
                if (data) {
                    console.log('Delete Success');
                    resolve();
                }
            });
        });
    }

    readFile(path) {
        return new Promise((resolve, reject) => {
            const params = { Bucket: bucketName, Key: path };

            this.s3.getObject(params, function (err, data) {
                if (err) {
                    console.log('Error', err);
                    reject(err);
                }
                if (data) {
                    console.log('Read Success');
                    resolve(data);
                }
            });
        });
    }

    isUsingS3() {
        return isUsingS3;
    }

    async emptyS3Directory(dir) {
        const listParams = {
            Bucket: bucketName,
            Prefix: dir,
        };

        const listedObjects = await this.s3.listObjectsV2(listParams).promise();

        if (listedObjects.Contents.length === 0) return;

        const deleteParams = {
            Bucket: bucketName,
            Delete: { Objects: [] },
        };

        listedObjects.Contents.forEach(({ Key }) => {
            deleteParams.Delete.Objects.push({ Key });
        });

        await this.s3.deleteObjects(deleteParams).promise();

        if (listedObjects.IsTruncated) await this.emptyS3Directory(dir);
    }
}

module.exports = new AmazonController();
