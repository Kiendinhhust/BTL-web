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
        // Check if base64Data exists
        if (!base64Data) {
            return '';
        }
    
        // Handle Buffer objects
        if (typeof base64Data === 'object' && base64Data.type === 'Buffer' && Array.isArray(base64Data.data)) {
            base64Data = Buffer.from(base64Data.data).toString('base64');
        }
    
        // Ensure base64Data is a string
        if (typeof base64Data !== 'string') {
            console.error('base64Data is not a string:', base64Data);
            return '';
        }
    
        // Add prefix if missing
        if (!base64Data.startsWith('data:image')) {
            return `data:image/jpeg;base64,${base64Data}`;
        }
    
        return base64Data;
    };
}

export default CommonUtils;
