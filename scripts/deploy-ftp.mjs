// Improved FTP directory creation logic

const ftp = require('basic-ftp');

async function ensureDirectory(ftpClient, remoteDir) {
    const segments = remoteDir.split('/');
    let currentPath = '';

    for (const segment of segments) {
        currentPath += segment + '/';
        try {
            // Attempt to change to the directory
            await ftpClient.cd(currentPath);
        } catch (err) {
            // If it does not exist, we create it
            await ftpClient.mkd(currentPath);
            // Change to the newly created directory
            await ftpClient.cd(currentPath);
        }
    }
}

module.exports = { ensureDirectory };