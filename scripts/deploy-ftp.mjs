// Improved FTP directory handling and error recovery

import ftp from 'some-ftp-library';

async function deploy() {
    try {
        // Establish FTP connection
        const client = new ftp();
        await client.connect({ host: 'your-ftp-host', user: 'your-username', password: 'your-password' });

        // Improved Directory Handling
        const remoteDir = '/path/to/remote/dir/';
        await client.ensureDir(remoteDir);

        // Upload files
        await client.uploadFrom('local/file/path', remoteDir + 'fileName.ext');

        console.log('File uploaded successfully!');
    } catch (error) {
        console.error('Error during FTP deploy:', error);
        // Error recovery logic
        // For example, retry the connection or log error details
    } finally {
        client.close();
    }
}

deploy();