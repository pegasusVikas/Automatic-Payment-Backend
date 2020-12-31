const mongoose=require("mongoose");
const connect=mongoose.connect(
    "mongodb+srv://admin:admin@cluster0.k27nm.mongodb.net/automatedPayment?retryWrites=true&w=majority",
    {useNewUrlParser: true,useUnifiedTopology: true}
).then(()=>{
    console.log("automated-payment database is connected");
}).catch((err)=>{
    console.log(err);
})
module.export =connect;