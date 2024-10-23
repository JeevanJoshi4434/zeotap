
# AST-Based Rule Engine API Documentation

This document provides an overview of the API endpoints for the **AST-Based Rule Engine**. The engine allows users to create, combine, evaluate, and modify rules based on attributes like age, department, salary, and more.

## Table of Contents
1. [Base URL](#base-url)
2. [Authentication](#authentication)
3. [API Endpoints](#api-endpoints)
   - [Create Rule](#create-rule)
   - [Create Rule with Functions](#create-rule-with-functions)
   - [Combine Rules](#combine-rules)
   - [Evaluate Rule](#evaluate-rule)
   - [Modify Rule](#modify-rule)
4. [Error Handling](#error-handling)
5. [Testing](#testing)

## Base URL
http://localhost:2454


## Authentication
This API does not require authentication. You can directly call the endpoints.

## API Endpoints

### 1. Create Rule
- **Endpoint**: `POST /create_rule`
- **Description**: Creates a new rule based on a rule string.
- **Request Body**:
    ```json
    {
        "ruleString": "(condition1 AND condition2)",
        "name": "Rule Name"
    }
    ```
- **Response**:
    - **Success (201)**:
        ```json
        {
            "message": "Rule created successfully",
            "ruleId": "<newRuleId>"
        }
        ```
    - **Error (500)**:
        ```json
        {
            "message": "Error creating rule",
            "error": "Error details"
        }
        ```

### 2. Create Rule with Functions
- **Endpoint**: `POST /createRuleWithFunction`
- **Description**: Creates a new rule that may include user-defined functions.
- **Request Body**:
    ```json
    {
        "ruleString": "(functionCall AND condition)",
        "name": "Rule Name",
        "functionCalls": ["functionName1", "functionName2"]
    }
    ```
- **Response**:
    - **Success (201)**:
        ```json
        {
            "message": "Rule created with function successfully",
            "ruleId": "<newRuleId>"
        }
        ```
    - **Error (400)**:
        ```json
        {
            "message": "Error creating rule with function",
            "error": "Error details"
        }
        ```

### 3. Combine Rules
- **Endpoint**: `POST /combineRule`
- **Description**: Combines multiple existing rules into a single rule.
- **Request Body**:
    ```json
    {
        "ruleIds": ["<ruleId1>", "<ruleId2>"]
    }
    ```
- **Response**:
    - **Success (200)**:
        ```json
        {
            "message": "Rules combined successfully",
            "combinedRootId": "<combinedRuleId>"
        }
        ```
    - **Error (500)**:
        ```json
        {
            "message": "Error combining rules",
            "error": "Error details"
        }
        ```

### 4. Evaluate Rule
- **Endpoint**: `POST /evaluate_rule`
- **Description**: Evaluates a specific rule against provided user data.
- **Request Body**:
    ```json
    {
        "ruleId": "<ruleId>",
        "userData": {
            "age": <number>,
            "department": "<string>",
            "salary": <number>,
            "experience": <number>
        }
    }
    ```
- **Response**:
    - **Success (200)**:
        ```json
        {
            "message": "Evaluation completed",
            "result": true // or false
        }
        ```
    - **Error (500)**:
        ```json
        {
            "message": "Error evaluating rule",
            "error": "Error details"
        }
        ```

### 5. Modify Rule
- **Endpoint**: `PUT /modify_rule/<ruleId>`
- **Description**: Modifies an existing rule by updating operators, operands, or adding conditions.
- **Request Body**:
    ```json
    {
        "modifications": [
            {
                "type": "update_operator",
                "newOperator": "OR" // or "AND"
            },
            {
                "type": "update_operand",
                "newValue": {
                    "field": "age",
                    "comparison": ">",
                    "value": 40
                }
            },
            {
                "type": "add_condition",
                "newCondition": "salary > 50000"
            }
        ]
    }
    ```
- **Response**:
    - **Success (200)**:
        ```json
        {
            "message": "Rule modified successfully"
        }
        ```
    - **Error (404)**:
        ```json
        {
            "message": "Rule not found"
        }
        ```
    - **Error (500)**:
        ```json
        {
            "message": "Error modifying rule",
            "error": "Error details"
        }
        ```

## Error Handling
All endpoints return standard error messages in case of failure. Specific errors include validation issues, not found errors, or server errors.

## Testing
To test the API, you can use tools like **Postman** or **cURL** commands as shown below.

### Example cURL Command
```bash
curl -X POST http://localhost:3000/create_rule \
-H "Content-Type: application/json" \
-d '{
    "ruleString": "(age > 30 AND department = \"Sales\")",
    "name": "Age Sales Rule"
}'
```