const mongoose= require('mongoose');
const marksSchema = mongoose.Schema(
    {
        Name:String,
        Empid:String,
        Batch_No:String,
        Sql_Marks:String,
        Unix_Marks:String,
        Java_Marks:String,
        Web_Marks:String
    }
);
module.exports= mongoose.model('marks',marksSchema);