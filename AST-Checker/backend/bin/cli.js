#!/usr/bin/env node

const axios = require('axios');
const process = require('process');

// Base URL for the API
const baseURL = 'http://localhost:3000';

// Parse command-line arguments
const args = process.argv.slice(2);
const command = args[0];

// Helper function to make API calls
const apiCall = async (endpoint, method = 'GET', data = {}) => {
    try {
        const response = await axios({
            method,
            url: `${baseURL}${endpoint}`,
            data
        });
        console.log(response.data);
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
    }
};

// Command handling
switch (command) {
    case 'create-rule':
        const ruleString = args[1];
        const name = args[2] || 'Unnamed Rule';
        apiCall('/create_rule', 'POST', { ruleString, name });
        break;

    case 'create-rule-with-function':
        const ruleStr = args[1];
        const ruleName = args[2] || 'Unnamed Function Rule';
        const functionCalls = args.slice(3); // Remaining args are function calls
        apiCall('/createRuleWithFunction', 'POST', { ruleString: ruleStr, name: ruleName, functionCalls });
        break;

    case 'combine-rules':
        const ruleIds = args.slice(1); // Assuming you pass rule IDs as arguments
        apiCall('/combineRule', 'POST', { ruleIds });
        break;

    case 'evaluate-rule':
        const evaluateRuleId = args[1];
        const userData = JSON.parse(args[2]); // Expect JSON string for user data
        apiCall('/evaluate_rule', 'POST', { ruleId: evaluateRuleId, userData });
        break;

    case 'modify-rule':
        const modifyRuleId = args[1];
        const modifications = JSON.parse(args[2]); // Expect JSON string for modifications
        apiCall(`/modify_rule/${modifyRuleId}`, 'PUT', { modifications });
        break;

    default:
        console.log(`Unknown command: ${command}`);
        console.log(`Available commands: create-rule, create-rule-with-function, combine-rules, evaluate-rule, modify-rule`);
        break;
}
