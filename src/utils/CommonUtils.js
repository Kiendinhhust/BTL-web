class CommonUtils {
    static fileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                resolve(reader.result);
            };
            reader.onerror = (error) => {
                reject(error);
            };
        });
    };

    static getBase64Image = (base64Data) => {
        const imageUrl = new Buffer(base64Data, 'base64').toString('binary');
    
        return imageUrl;
    };
}

export default CommonUtils;
