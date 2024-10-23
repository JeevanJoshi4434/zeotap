const userDefinedFunctions = {
    isPrime: (num) => {
        if (num <= 1) return false;
        for (let i = 2; i < num; i++) {
            if (num % i === 0) return false;
        }
        return true;
    },
    // Add other functions like isEven, isOdd, etc.
};

module.exports ={ userDefinedFunctions};