const Helpers = {
    generateUUID: () => {
        const uuid = uuidv1();  
        return uuid;
     },
    sum: (a,b) => { 
        return a+b;
     }
 
 
}


module.exports = Helpers