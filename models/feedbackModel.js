const mongoose= require('mongoose');
const feedbackSchema = mongoose.Schema(
    {
        Name:String,
        Empid:String,
        BC_ID:String,
        Feedback:String
    
    }
);
module.exports= mongoose.model('feedback',feedbackSchema);