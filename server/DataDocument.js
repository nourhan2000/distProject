/** ***************************************************
   Create schema
   Contain all the data of our doucment in our database 
*********************************************************/

const { Schema, model } = require('mongoose')

// Setting up the schema **** Name of Schema : Data Document **** 
const DataDocument = new Schema({
    _id: String,
    data: Object
})

//Now we call the models needed 
module.exports = model("DataDocument", DataDocument, "DataDocument")

/**After creating this file, it gives us the ability to store pieces of information**/


