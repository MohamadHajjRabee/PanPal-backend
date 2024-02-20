const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Recipe = require("./model.js")
require('dotenv').config()
const app = express();


app.use(express.json())
app.use(express.urlencoded({extended: true}));
app.use(cors())
mongoose.connect(process.env.MONGODB,{
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(()=> {
    console.log("Successfully connect to MongoDB.");
}).catch(err => {
    console.error("Connection error", err);
    process.exit();
})


app.get("/home", async (req,res) => {
    const categories = [['Breakfast', 'Lunch', 'Dinner', 'Budget dinners'], ['Desserts', 'High protein', 'Low calorie', 'Fitness & lifestyle'], ['Chicken', 'Cocktails', 'Salads', 'Mocktails'], ['Picnics', 'Sweet treats', 'Quick bakes', 'Cakes']]
    let content = []
    const {page = 1} = req.query;
    if(page > 4){
        res.json(null);
        return;
    }
    for (let i = 0; i < 4; i++){
        const categoryName = categories[page - 1][i]

        const data = await Recipe.aggregate([
            { $match: {subcategory: categories[page - 1][i]} },
            { $group: {_id: '$name', id: { $first: '$_id' }, image: { $first: '$image' }, difficult: { $first: '$difficult' }, ratings: { $first: '$ratings' }, times: { $first: '$times' }, vote_count: { $first: '$vote_count' }}},
            { $project: {_id: '$id', name: '$_id', image: 1, difficult: 1, ratings: 1, times: 1, vote_count: 1}},
            { $sort: { vote_count: -1 }},
            { $limit: 10 },
        ]);
        content.push([categoryName, ...data])
    }

    res.json(content)
})

app.get("/search", async (req, res) => {

    try {
        const userSearch = req.query.userSearch;
        const page = parseInt(req.query.page)
        const sanitizedSearch = userSearch.replace(/[-\\^$*+?.()|[\]{}]/g, '\\$&');
        const regex = new RegExp(`\\b${sanitizedSearch}`, 'i');
        const results = await Recipe.aggregate([
            { $match: {name: { $regex: regex }}},
            { $group: {_id: '$name', id: { $first: '$_id' }, vote_count: { $first: '$vote_count' }}},
            { $project: {_id: '$id', name: '$_id', vote_count: 1}},
            { $sort: { vote_count: -1 }},
            { $skip: (page - 1) * 10 },
            { $limit: 10 },

        ]);

        res.json(results);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
})

app.get("/recipe/:id", async (req, res)=> {
    try {
        const id = req.params.id
        const recipe = await Recipe.findById(id)
        res.json(recipe)
    }catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
})

app.get("/categories", async (req, res) => {

    const categories = await Recipe.distinct('subcategory');
    res.json(categories)
})

app.get("/category/:category", async (req, res) => {

    try {
        const {category} = req.params
        const recipe = await Recipe.aggregate([
            { $match: {subcategory: category }},
            { $group: {_id: '$name', id: { $first: '$_id' }, image: { $first: '$image' }, vote_count: { $first: '$vote_count' }}},
            { $project: {_id: '$id', name: '$_id', image: 1,  vote_count: 1}},
            { $sort: { vote_count: -1 }},
        ]);
        res.json(recipe)
    }catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
})


app.listen(process.env.PORT, () => {
    console.log("Server is running on port ", process.env.PORT)
})
