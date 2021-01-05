const mongoose = require("mongoose");

const ServiceSchema = mongoose.Schema({
	id: {
		type: String,
		required: true,
		unique: true,
	},
	wallet: {
		type: String,
		required: true,
		unique: true
	},
	key: {
		type: String, 
		required: true,
		unique: true
	},
	type: {
		type: String,
		required: true,
		unique: true,
	},
	message: {
		type: String,
		required: true
	}
});

module.exports = mongoose.model("Service", ServiceSchema);