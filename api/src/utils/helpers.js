const { v4: uuidv4 } = require('uuid');

const Helpers = {
    generateUUID: () => {
     return uuidv4();  
         
     },
     specialCharacter: (input)=>{
        if(input.includes(";")|| input.includes("'")|| input.includes('"')|| input.includes("`")|| input.includes(">")|| input.includes("<")){
            return true
        }else{
            return false
        }
     },
    sum: (a,b) => { 
        return a+b;
     }

}


module.exports = Helpers