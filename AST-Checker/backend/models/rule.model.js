const mongoose = require('mongoose');

//Node schema for the AST
const NodeSchema = new mongoose.Schema({
    type: { 
        type: String, 
        required: true 
    }, // "operator" or "operand"
    left: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Node', 
        default: null 
    },
    right: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Node', 
        default: null 
    },
    value: { 
        type: mongoose.Schema.Types.Mixed, 
        default: null 
    } // For operand nodes
});

const RuleSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    root: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Node' 
    },
    ruleString: { 
        type: String, 
        // required: true 
    } // Add this line
});


const Node = mongoose.model('Node', NodeSchema);
const Rule = mongoose.model('Rule', RuleSchema);

module.exports = { Node, Rule };
