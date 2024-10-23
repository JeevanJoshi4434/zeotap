const { Node, Rule } = require('../models/rule.model');
const { parseRuleString, evaluateAST, updateOperator, updateOperandValue, addConditionToAST, parseRuleStringToAST, populateNodeRecursively, deleteAST } = require('./functions');
 
exports.createRule = async (req, res) => {
    const { ruleString, name } = req.body;

    try {
        parseRuleString(ruleString);

        const rootNode = await parseRuleStringToAST(ruleString);

        const newRule = new Rule({
            name,
            root: rootNode._id,
            ruleString
        });
        await newRule.save();

        res.status(201).json({
            message: 'Rule created successfully',
            ruleId: newRule._id,
            success:true
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error creating rule',
            error: error.message,
            success:false
        });
    }
};


exports.combineRule = async (req, res) => {
    const { ruleIds, combinedName } = req.body;

    try {
        const rules = await Rule.find({ _id: { $in: ruleIds } }).populate('root');
        if (rules.length < 2) {
            return res.status(400).json({ message: 'At least two rules are required to combine' });
        }
        const combinedRoot = new Node({ type: 'operator', value: 'AND' });
        combinedRoot.left = rules[0].root._id; 
        combinedRoot.right = rules[1].root._id; 
        let lastNode = combinedRoot;

        const nodes = [combinedRoot];


        await combinedRoot.save();

       for (let i = 2; i < rules.length; i++) {

            const rule = rules[i];
            const newNode = new Node({ type: 'operator', value: 'AND' });

            
            newNode.left = nodes[nodes.length - 1]._id; 

            newNode.right = rule.root._id; 

            
            lastNode = newNode;

            await newNode.save();
            nodes.push(newNode);
        }


        const newRule = new Rule({
            name: combinedName || 'Combined Rule',
            description: 'This rule combines multiple rules.',
            root: nodes[nodes.length - 1]._id 
        });
        await newRule.save();

        res.status(200).json({ message: 'Rules combined successfully', combinedRootId: combinedRoot._id, combinedRuleId: newRule._id, success:true });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error combining rules', error: error.message });
    }
};



exports.evaluateRule = async (req, res) => {
    const { ruleId, userData } = req.body;

    try {
     
        const rule = await Rule.findById(ruleId).populate('root');

        
        await populateNodeRecursively(rule.root);

        console.log(rule);
        const result = evaluateAST(rule.root, userData); 

        console.log(result); 
        res.status(200).json({ message: 'Evaluation completed', result });
    } catch (error) {
        res.status(500).json({ message: 'Error evaluating rule', error: error.message });
    }
};



exports.modifyRule = async (req, res) => {
    const { ruleId } = req.params;
    const { newRuleString } = req.body; 

    try {
       
        const rule = await Rule.findById(ruleId).populate('root');
        if (!rule) {
            return res.status(404).json({ message: 'Rule not found' });
        }

       
        try {
            parseRuleString(newRuleString);
        } catch (error) {
            return res.status(400).json({ message: 'Invalid rule format', error: error.message });
        }

         if (rule.ruleString === newRuleString) {
            return res.status(200).json({ message: 'No changes detected, rule remains the same' });
        }

        await deleteAST(rule.root); 
        
        const newRootNode = await parseRuleStringToAST(newRuleString);

       
        rule.root = newRootNode._id;
        rule.ruleString = newRuleString;
        await rule.save();

        res.status(200).json({ message: 'Rule modified successfully', newRule: rule });
    } catch (error) {
        res.status(500).json({ message: 'Error modifying rule', error: error.message });
    }
};




exports.createRuleWithFunction = async (req, res) => {
    const { ruleString, name, functionCalls } = req.body;

    try {
       
        const rootNode = parseRuleStringToAST(ruleString, functionCalls); 
        await rootNode.save();

        const newRule = new Rule({ name, root: rootNode._id, ruleString });
        await newRule.save();

        res.status(201).json({ message: 'Rule created with function successfully', ruleId: newRule._id });
    } catch (error) {
        res.status(400).json({ message: 'Error creating rule with function', error: error.message });
    }
};


exports.getRule = async (req, res) => {
    try {
        const rules = await Rule.find();
        res.status(200).json({ rules });

    } catch (error) {
        res.status(500).json({ message: 'Error fetching rules', error: error.message });
    }
}