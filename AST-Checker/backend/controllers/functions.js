const { supportedOperators, validAttributes } = require("../configs/configs");
const { userDefinedFunctions } = require("./userDefinedFunctions");
const { Node } = require("../models/rule.model");
function parseRuleString(ruleString) {

    for (let operator of supportedOperators) {
        if (ruleString.includes(operator)) {
            const [leftOperand, rightOperand] = ruleString.split(operator);
            if (!leftOperand || !rightOperand) {
                throw new Error(`Invalid rule string format near operator "${operator}".`);
            }
        }
    }

    if (!ruleString.match(/^\(.+\)$/)) {
        throw new Error("Rule string must be enclosed in parentheses and include valid conditions.");
    }
    // ... more specific validation rules

    return true;
}


function validateAttributes(node) {
    if (node.type === 'operand') {
        const { field } = node.value;
        if (!validAttributes.includes(field)) {
            throw new Error(`Invalid attribute "${field}". Must be one of: ${validAttributes.join(', ')}`);
        }
    }
}


const evaluateAST = (node, data) => {
    if (node.type === 'operand') {
        const { field, comparison, value } = node.value;

        if (!(field in data)) {
            throw new Error(`Field "${field}" not found in user data.`);
        }

        const userValue = data[field];

        switch (comparison) {
            case '>':
                return Number(userValue) > Number(value);
            case '<':
                return Number(userValue) < Number(value);
            case '=':
                return String(userValue) === String(value);
            case '>=':
                return Number(userValue) >= Number(value);
            case '<=':
                return Number(userValue) <= Number(value);
            case '!=':
                return String(userValue) !== String(value);
            default:
                throw new Error(`Unsupported comparison operator: "${comparison}"`);
        }
    } else if (node.type === 'operator') {
        const leftResult = evaluateAST(node.left, data); // Access embedded left node
        const rightResult = evaluateAST(node.right, data); // Access embedded right node

        return node.value === 'AND' ? (leftResult && rightResult) : (leftResult || rightResult);
    }
};



function updateOperator(astNode, newOperator) {
    if (astNode.type === 'operator') {
        astNode.value = newOperator;
    }
    
}

function updateOperandValue(astNode, newValue) {
    if (astNode.type === 'operand') {
        astNode.value = newValue;
    }
   
}

function addConditionToAST(astNode, newCondition) {
    
    const newNode = new Node({ type: 'operand', value: newCondition });
    if(astNode.right !== null){
        newNode.right = astNode.right;
    }
    astNode.right = newNode._id; 
    newNode.save();
}



function evaluateUserDefinedAST(node, data) {
    if (node.type === 'operand') {
        const { field, comparison, value, functionCall } = node.value;

        if (functionCall) {
            const functionToCall = userDefinedFunctions[functionCall.name];
            if (functionToCall) {
                return functionToCall(data[field]);
            } else {
                throw new Error(`Unknown function: ${functionCall.name}`);
            }
        }

        switch (comparison) {
            case '>':
                return data[field] > value;
            case '=':
                return data[field] === value;

        }
    }

}

async function parseRuleStringToAST(ruleString) {
    const operators = ['AND', 'OR'];

    // Use regex to match conditions correctly, including operators
    const tokens = ruleString.match(/([()])|(\w+\s*(>=|<=|!=|>|<|=)\s*['"]?\w+['"]?)|(AND|OR)/g);

    // Check if tokens were generated
    if (!tokens) {
        throw new Error('Invalid rule string format: unable to tokenize.');
    }

    // Stack for nodes and operators
    const nodeStack = [];
    const operatorStack = [];

    const precedence = {
        'AND': 1,
        'OR': 0
    };

    // Function to create and save a node asynchronously
    const createNode = async (token) => {
        const match = token.match(/(\w+)\s*(>=|<=|!=|>|<|=)\s*(['"]?)(\w+)\3/);
        if (!match) {
            throw new Error(`Invalid condition format: "${token}"`);
        }

        const field = match[1].trim();
        const comparison = match[2].trim();
        const value = match[4].trim().replace(/['"]/g, ''); // Remove quotes

        const operandNode = new Node({
            type: 'operand',
            value: {
                field: field,
                comparison: comparison,
                value: value
            }
        });

        // Save the operand node to the database
        await operandNode.save();
        return operandNode; // Return the operand node
    };
    console.log({ opr: operators, opStack: operatorStack, nodeStack: nodeStack });
    // Main loop to parse and process tokens
    for (let token of tokens) {
        console.log({ token: token });
        if (operators.includes(token)) {
            console.log({ token: token, included: true, opStack: operatorStack, nodeStack: nodeStack });
            while (operatorStack.length && precedence[operatorStack[operatorStack.length - 1]] >= precedence[token]) {
                const operator = operatorStack.pop();
                const rightNode = nodeStack.pop(); // Get the right node (child)
                const leftNode = nodeStack.pop(); // Get the left node (child)

                // Create an operator node with left and right child nodes
                const operatorNode = new Node({
                    type: 'operator',
                    value: operator,
                    left: leftNode._id,  // Reference the left operand/operator node
                    right: rightNode._id // Reference the right operand/operator node
                });

                console.log(operatorNode, leftNode, rightNode);

                // Save the operator node to the database
                await operatorNode.save();
                nodeStack.push(operatorNode); // Push the operator node back to the stack
            }
            operatorStack.push(token); // Push the current operator to the stack
        } else if (token === '(') {
            operatorStack.push(token); // Push '(' to the operator stack
        } else if (token === ')') {
            while (operatorStack.length && operatorStack[operatorStack.length - 1] !== '(') {
                const operator = operatorStack.pop();
                const rightNode = nodeStack.pop();
                const leftNode = nodeStack.pop();

                // Create an operator node with left and right children
                const operatorNode = new Node({
                    type: 'operator',
                    value: operator,
                    left: leftNode._id,
                    right: rightNode._id
                });

                // Save the operator node to the database
                await operatorNode.save();
                nodeStack.push(operatorNode);
            }
            operatorStack.pop(); // Remove '(' from the stack
        } else {
            // Handle the operand (e.g., conditions like `age > 30`)
            const operandNode = await createNode(token);
            nodeStack.push(operandNode); // Push the operand node to the stack
        }
    }

    // Handle remaining operators in the stack
    while (operatorStack.length) {
        const operator = operatorStack.pop();
        const rightNode = nodeStack.pop();
        const leftNode = nodeStack.pop();

        // Create an operator node with left and right children
        const operatorNode = new Node({
            type: 'operator',
            value: operator,
            left: leftNode._id,
            right: rightNode._id
        });

        // Save the operator node to the database
        await operatorNode.save();
        nodeStack.push(operatorNode);
    }

    // The root of the AST should be the last node in the stack
    return nodeStack.pop(); // Return the constructed AST root node
}


const populateNodeRecursively = async (node) => {
    // Populate left child if it exists
    if (node.left) {
        const leftChild = await Node.findById(node.left).populate({
            path: 'left',
            model: 'Node', // Ensure you specify the model
            populate: {
                path: 'left right',
                model: 'Node', // Populate deeply nested children
            }
        });
        node.left = leftChild; // Assign populated left child back to node

        // Recursively populate left child if it has children
        await populateNodeRecursively(node.left);
    }

    // Populate right child if it exists
    if (node.right) {
        const rightChild = await Node.findById(node.right).populate({
            path: 'right',
            model: 'Node',
            populate: {
                path: 'left right',
                model: 'Node',
            }
        });
        node.right = rightChild; // Assign populated right child back to node

        // Recursively populate right child if it has children
        await populateNodeRecursively(node.right);
    }
};


const deleteAST = async (node) => {
    if (node.type === 'operator') {
        // If the node is an operator, recursively delete the left and right children
        if (node.left) {
            const leftNode = await Node.findById(node.left);
            await deleteAST(leftNode); // Recursive deletion of left child
        }
        if (node.right) {
            const rightNode = await Node.findById(node.right);
            await deleteAST(rightNode); // Recursive deletion of right child
        }
    }

    // Finally, delete the current node itself
    await Node.findByIdAndDelete(node._id);
};


module.exports = { 
    parseRuleString, 
    evaluateUserDefinedAST, 
    populateNodeRecursively, 
    validateAttributes, 
    evaluateAST, 
    updateOperator, 
    updateOperandValue, 
    addConditionToAST, 
    parseRuleStringToAST, 
    deleteAST 
};