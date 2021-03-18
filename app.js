const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();

app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended:true})); 
app.use(express.static("public")); //For Static behaviour
const PORT = 3000;
//var newItems=["Buy Food","Cook Food","Eat Food"];
//var workItems=[];

mongoose.connect("mongodb://localhost:27017/todoListDB", {useNewUrlParser: true, useUnifiedTopology: true});

const itemsSchema={
    name:String
};

const Item = mongoose.model('item', itemsSchema);

const item1=new Item({
    name:"Welcome to your todo List"
});

const item2=new Item({
    name:"Hit the + button to add a new Item"
});

const item3=new Item({
    name:"<---- Hit this to delete "
});

var defaultItems=[item1,item2,item3];


const listSchema={
    listName:String,
    items: [itemsSchema]
}

const List=mongoose.model("List",listSchema)


app.get('/',(req,res) =>{
    var today = new Date();
    var options = {
        weekday: "long",
        day: "numeric",
        year: "numeric"
    };

    var day=today.toLocaleDateString("en-US",options);

    Item.find({},(err,foundItems)=>{

        if(foundItems.length===0)
        {
            Item.insertMany(defaultItems,(err)=>{
                if(err)
                console.log("Error in entering Default Items "+err);
                else{
                    console.log("Successfully Inserted Default Items");
                }
            });
            res.redirect("/");
        }
        else
        {
            res.render('list',{
                listTitle : day,
                newListItems:foundItems
             
            });
        }
    });
    
});

app.get("/:cutomListName",(req,res)=>{
    var customListName=req.params.customListName;

    List.findOne({listName:customListName},(err,foundList)=>{
        if(!err)
        {
            if(!foundList)
            {
                //Create List
                const list = new List({
                    name : customListName,
                    items:defaultItems
                });

                list.save();
                res.redirect("/"+customListName);
            }
            else
            {
                res.render("list",{listTitle:customListName,newListItems:foundList.items});
            }
        }
    });

   
    
});

app.post('/',  (req, res)=> {

    if(req.body.newItem=="")
    {
        res.redirect("/")
    }
    else if(req.body.button ==="Work List")
    {
        var item = req.body.newItem;
        workItems.push(item);
        res.redirect("/work");
    }
    else
    {
        var itemName =req.body.newItem;
        const item = new Item({
            name : itemName
        });
        item.save();
        res.redirect("/");
    }
});

app.post('/delete',(req,res)=>{
     const checkeItemID = req.body.checkbox;
     Item.findByIdAndRemove(checkeItemID,(err)=>{
        if(!err)
        {
            console.log("Item Deleted Successfully");
            res.redirect("/");
        }
     });
});




app.listen(PORT, () => console.log(`Example app listening on port port!`));