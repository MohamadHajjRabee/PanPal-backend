const mongoose = require("mongoose");

const recipeSchema = new mongoose.Schema({
    url: { type: String, required: true },
    image: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    author: { type: String, required: true },
    ratings: { type: Number, default: 0, alias: 'rattings' },
    ingredients: { type: [String], required: true },
    steps: { type: [String], required: true },
    nutrients: {
        kcal: String,
        fat: String,
        saturates: String,
        carbs: String,
        sugars: String,
        fibre: String,
        protein: String,
        salt: String
    },
    times: {
        Preparation: String,
        Cooking: String
    },
    serves: Number,
    difficult: String,
    vote_count: { type: Number, default: 0 },
    subcategory: String,
    dish_type: String,
    main_category: {type: String, alias: "maincategory"}
});
const Recipe = mongoose.model('Recipe', recipeSchema);

module.exports = Recipe;