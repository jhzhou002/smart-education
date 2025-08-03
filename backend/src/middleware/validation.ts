import { Request, Response, NextFunction } from 'express'
import Joi from 'joi'

export function validate(schema: Joi.ObjectSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body)
    
    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ')
      return res.status(400).json({ message: '请求数据验证失败', details: errorMessage })
    }
    
    next()
  }
}

// 用户注册验证
export const registerSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required()
    .messages({
      'string.alphanum': '用户名只能包含字母和数字',
      'string.min': '用户名长度至少3位',
      'string.max': '用户名长度不能超过30位',
      'any.required': '用户名为必填项'
    }),
  email: Joi.string().email().required()
    .messages({
      'string.email': '邮箱格式不正确',
      'any.required': '邮箱为必填项'
    }),
  password: Joi.string().min(6).required()
    .messages({
      'string.min': '密码长度至少6位',
      'any.required': '密码为必填项'
    }),
  name: Joi.string().min(2).max(50).required()
    .messages({
      'string.min': '姓名长度至少2位',
      'string.max': '姓名长度不能超过50位',
      'any.required': '姓名为必填项'
    }),
  phone: Joi.string().pattern(/^1[3-9]\d{9}$/).optional()
    .messages({
      'string.pattern.base': '手机号格式不正确'
    }),
  school: Joi.string().max(100).optional(),
  grade: Joi.string().valid('高一', '高二', '高三').required()
    .messages({
      'any.only': '年级必须是高一、高二或高三',
      'any.required': '年级为必填项'
    })
})

// 用户登录验证
export const loginSchema = Joi.object({
  email: Joi.string().email().required()
    .messages({
      'string.email': '邮箱格式不正确',
      'any.required': '邮箱为必填项'
    }),
  password: Joi.string().required()
    .messages({
      'any.required': '密码为必填项'
    })
})

// 开始测试验证
export const startAssessmentSchema = Joi.object({
  chapter_id: Joi.number().integer().positive().required()
    .messages({
      'number.base': '章节ID必须是数字',
      'number.integer': '章节ID必须是整数',
      'number.positive': '章节ID必须是正数',
      'any.required': '章节ID为必填项'
    }),
  question_count: Joi.number().integer().min(5).max(20).optional()
    .messages({
      'number.base': '题目数量必须是数字',
      'number.integer': '题目数量必须是整数',
      'number.min': '题目数量不能少于5题',
      'number.max': '题目数量不能超过20题'
    })
})