const { v4: uuidv4 } = require('uuid');

const Helpers = {
    generateUUID: () => {
     return uuidv4();  
         
     },
    sum: (a,b) => { 
        return a+b;
     }

}


module.exports = Helpers