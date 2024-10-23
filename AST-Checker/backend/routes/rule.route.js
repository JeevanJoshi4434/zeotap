const { createRule, createRuleWithFunction, combineRule, modifyRule, evaluateRule, getRule } = require('../controllers/rule.controller');

const Router = require('express').Router();

Router.route('/create_rule').post(createRule);
Router.route('/createRuleWithFunction').post(createRuleWithFunction);
Router.route('/combineRule').post(combineRule);
Router.route('/evaluate_rule').post(evaluateRule);
Router.route('/modify_rule/:id').put(modifyRule);
Router.route('/get/rules').get(getRule);

// Directly export the router
module.exports = Router;
