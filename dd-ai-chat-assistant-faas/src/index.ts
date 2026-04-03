import { FieldType, fieldDecoratorKit, FormItemComponent, FieldExecuteCode,AuthorizationType } from 'dingtalk-docs-cool-app';
const { t } = fieldDecoratorKit;

// 通过addDomainList添加请求接口的域名
fieldDecoratorKit.setDomainList(['base-api.aimaxhug.com','yi-test.aimaxhug.com','stag-base-api.aimaxhug.com']);
// ==================== 1. 基础配置与工具模块 ====================
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid'; 



const AI_SERVICE_URL = '111https://stag-base-api.aimaxhug.com/api/v1/chat';// 测试环境
const AI_SERVICE_URL1 = 'https://base-api.aimaxhug.com/api/v1/chat'; // 生产环境
const AI_SERVICE_URL2 = 'http://yi-test.aimaxhug.com:3200/api/v1/chat'; // 本地环境
const REQUEST_HEADERS = {
    'Content-Type': 'application/json',
    'User-Agent': 'Feishu-Field-Kit/1.0',
    'x-feishu-plugin': 'true'  //
};
fieldDecoratorKit.setDecorator({
  name: 'FaaS字段模板 - 汇率转换',
  // 定义捷径的i18n语言资源
  i18nMap: {
    'zh-CN': {
      'rmb': '人民币金额',
      'target': '目标币种',
      'USD': '美元',
      'EUR': '欧元',
    },
    'en-US': {
      'rmb': 'RMB Amount',
      'target': 'Target Currency',
      'USD': 'US Dollar',
      'EUR': 'Euro',
    },
    'ja-JP': {
      'rmb': '人民元の金額',
      'target': 'ターゲット通貨',
      'USD': '米ドル',
      'EUR': 'ユーロ',
    },
  },
  // 定义捷径的入参
  formItems: [
        {
            key: 'message',
            label: '提示词',
            component: FormItemComponent.Textarea, // 使用 Textarea 代替 Input
            props: {
                placeholder: '请输入你的提示词',
                enableFieldReference: true
            },
            validator: { required: true },
            tooltips: { title: '请输入你的提示词' } // 注意：钉钉 tooltips 是对象而非数组
        },

        {
            key: 'attachment',
            label: '参考图',
            component: FormItemComponent.FieldSelect,
            props: {
                mode: 'multiple',
                supportTypes: [FieldType.Attachment] // 注意：属性名是 supportTypes (复数)
            },
            validator: { required: false },
            tooltips: { title: '注意:只有多模态模型支持图片输入' }
        },

        {
            key: 'system_prompt',
            label: '系统提示词（可选）',
            component: FormItemComponent.Textarea,
            props: {
                placeholder: '用于设定角色和行为规范',
                enableFieldReference: true
            },
              validator: { required: false },
            tooltips: { title: '可设定"角色"或"说话风格"' }
        },
        {
            key: 'model',
            label: '模型名称（可填）',
            component: FormItemComponent.Textarea, // 类型定义中无单行文本，统一使用 Textarea
            props: {
                placeholder: '填入指定的模型名称（默认自动匹配）'
            },
              validator: { required: false },
            tooltips: { title: '最大输入限制100以内字符数' }
        }
  ],
  // 定义捷径的返回结果类型
  resultType: {
    type: FieldType.Text,
  },

    authorizations: 
    {
      id: 'aimaxhug_auth',// 授权的id，用于context.fetch第三个参数指定使用
      platform: 'aimaxhug',// 授权平台，目前可以填写当前平台名称
      type: AuthorizationType.MultiHeaderToken, // 授权类型
      // 用户可以填写的key
      params: [
        { key: "Authorization", placeholder: "Bearer APIKey" }
      ],
      required: true,// 设置为选填，用户如果填了授权信息，请求中则会携带授权信息，否则不带授权信息
      instructionsUrl: "https://aimaxhug.com/",// 帮助链接，告诉使用者如何填写这个apikey
      label: 'aimaxhug', // 授权平台，告知用户填写哪个平台的信息
      tooltips: 'https://zhikemax.feishu.cn/wiki/L26mwubn8i5c65kYgSocKVNenpd', // 提示，引导用户添加授权
      // 当前平台的图标
      icon: {
        light: 'https://yinshan-1300111615.cos.ap-chengdu.myqcloud.com/aimaxhug/logo.png', 
        dark: 'https://yinshan-1300111615.cos.ap-chengdu.myqcloud.com/aimaxhug/logo.png'
      }
    },
  

  // formItemParams 为运行时传入的字段参数，对应字段配置里的 formItems （如引用的依赖字段）
  execute: async (context, formData) => {
    const { model, system_prompt,message,attachment } = formData;
     const logID = context.extensionId || createUniqueId('DD_task');
      const startTime = Date.now();

            debugLog('===001 钉钉执行开始 ===', { 
                formData,
                baseId: context.baseId, // 可以记录这些已存在的上下文信息
                sheetId: context.sheetId 
            }, logID);
           try {
              const apiKey = getApiKeyFromConfig();

            const requestBody = buildRequestBody(formData,logID);

             // 记录请求体构建完成
            const requestBodySize = JSON.stringify(requestBody).length;
            debugLog({
                '===002 请求体构建完成': {
                    model: requestBody.model,
                    hasMessage: !!requestBody.message,
                    hasSystemPrompt: !!requestBody.system_prompt,
                    hasAttachment: !!(requestBody.attachment && requestBody.attachment.length > 0),
                    attachmentCount: requestBody.attachment ? requestBody.attachment.length : 0,
                    attachmentDetails: requestBody.attachment ? requestBody.attachment.map((att: any) => ({
                        name: att.name,
                        type: att.type,
                        size: att.size
                    })) : [],
                    requestBodySize: requestBodySize,
                    requestBodySizeKB: (requestBodySize / 1024).toFixed(2) + 'KB',
                    requestBody: requestBody
                }
            }, undefined, logID);

           const requestStartTime = Date.now();
   
               // 使用 context 提供的 fetch 方法
               const response = await context.fetch(
                AI_SERVICE_URL1, 
                {
                   method: 'POST',
                    headers: {
                    ...REQUEST_HEADERS,
                    'Authorization': `Bearer ${apiKey}`
                    },
                   body: JSON.stringify(requestBody)
               },'aimaxhug_auth');



                           // 记录HTTP请求状态
            const requestEndTime = Date.now();
            const requestDuration = requestEndTime - requestStartTime;
            debugLog({
                '===004 HTTP请求完成': {
                    status: response.status,
                    ok: response.ok,
                    requestDuration: requestDuration + 'ms',
                    requestDurationSeconds: (requestDuration / 1000).toFixed(2) + 's'
                }
            }, undefined, logID);

            // ==================== 第四步：解析响应 ====================
            
            const result = await response.json();

            // 记录接收响应结果
            debugLog({
                '===006 接收响应结果': {
                    resultType: typeof result,
                    hasStatus: 'status' in result,
                    status: result?.status,
                    hasData: 'data' in result && !!result.data
                }
            }, undefined, logID);

            // ==================== 第五步：后端状态码检查 ====================

            // 后端返回格式: { code: 200, message: "ok", data: {...} } 或 { status: 200, data: {...} }
            const statusVal = (typeof result.status === 'number') ? result.status
                : (typeof result.code === 'number' ? result.code : undefined);
            if (!result || typeof result !== 'object' || typeof statusVal !== 'number') {
                debugLog({
                    '===007 响应格式错误': { 
                        resultType: typeof result
                    } 
                }, undefined, logID);
                return createErrorResponse('后端服务器返回了无效的响应格式');
            }


          
            // 检查后端业务状态码
            if (statusVal !== 200) {
                let errorMessage = result.message || `后端服务器业务处理异常(状态码:${statusVal})`;
                // 根据不同的状态码提供具体错误信息
                switch (statusVal) {
                    case 400:
                        errorMessage = `请求参数错误：${result.message || '请检查请求参数格式和必填字段'}`;
                        break;
                    case 401:
                        errorMessage = `认证失败：${result.message || '请检查API Key是否正确'}`;
                        break;
                    case 403:
                        errorMessage = `无权限：${result.message || '您没有权限访问此资源，请检查账号权限'}`;
                        break;
                    case 500:
                        errorMessage = `服务器内部错误：${result.message || '请联系技术支持'}`;
                        break;
                    default:
                        // 处理其他未预期的错误码
                        errorMessage = result.message || `服务器返回错误(状态码:${statusVal})，请联系技术支持`;
                        break;
                }

                debugLog({
                    '===008 后端服务器返回错误': {
                        code: statusVal,
                        message: result.message
                    }
                }, undefined, logID);

                return createErrorResponse(errorMessage);
            }


            // ==================== 第六步：提取响应数据 ====================

            const { aiContent } = extractResponseData(result);

            // ==================== 第七步：返回成功结果 ====================

            // 记录成功返回
            const endTime = Date.now();
            const totalDuration = endTime - startTime;
            const httpDuration = requestEndTime - requestStartTime;
            const responseSize = JSON.stringify(result).length;
            debugLog({
                '===009 成功返回结果': {
                    code: FieldExecuteCode.Success,
                    dataLength: aiContent ? aiContent.length : 0,
                    dataLengthKB: aiContent ? (aiContent.length / 1024).toFixed(2) + 'KB' : '0KB',
                    responseSize: responseSize,
                    responseSizeKB: (responseSize / 1024).toFixed(2) + 'KB',
                    totalDuration: totalDuration + 'ms',
                    totalDurationSeconds: (totalDuration / 1000).toFixed(2) + 's',
                    httpDuration: httpDuration + 'ms',
                    httpDurationSeconds: (httpDuration / 1000).toFixed(2) + 's'
                }
            }, undefined, logID);



   
               return {
                   code: FieldExecuteCode.Success,
                   data: aiContent
               };
   
           } catch (error: any) {
               debugLog('=== 执行异常 ===', { error: error.message }, logID);
               return {
                   code: FieldExecuteCode.Error,
                   data: `❌ 服务异常: ${error.message}`
               };
           }
  },
});


/************    工具调用   *********************** */

/**
 * 生成唯一 任务ID
 */
const createUniqueId = (() => {
  let lastTimestamp = 0;
  let counter = 0;
  
  return (prefix = 'dingding') => {
    return `${prefix}_${uuidv4()}`;
  };
})();


/**
 * 3.5 安全提取响应数据
 * @param {Object} result - API响应结果
 * @returns {Object} 提取的数据对象
 */
function extractResponseData(result: any): { aiContent: string } {
    // 提取AI大模型回复内容
    const aiContent = (result && typeof result === 'object' && 'data' in result &&
        result.data && typeof result.data === 'object' && 'output_result' in result.data &&
        typeof result.data.output_result === 'string')
        ? result.data.output_result
        : '无回复内容';

    return {
        aiContent,
    };
}


/**
 * 从 config.json 中获取 API Key
 */
function getApiKeyFromConfig(): string {
    try {
        const rootConfigPath = path.join(process.cwd(), 'config.json');
        if (!fs.existsSync(rootConfigPath)) throw new Error(`未找到配置: ${rootConfigPath}`);
        
        const config = JSON.parse(fs.readFileSync(rootConfigPath, 'utf8'));
        const apiKey = config?.authorizations?.aimaxhug_auth;
        
        if (!apiKey) throw new Error('config.json 中未找到 aimaxhug_auth');
        return apiKey;
    } catch (error: any) {
        throw new Error(`读取配置失败: ${error.message}`);
    }
}

/**
 * 3.4 创建错误响应
 * @param {string} errorMessage - 错误消息
 * @returns {Object} 标准化错误响应
 */
function createErrorResponse(errorMessage: string): { code: any; data: string } {
    return {
        code: FieldExecuteCode.Error,
        data: `❌ 错误：${errorMessage}`
    };
}
/**
 * 3.1 调试日志函数
 * @description 输出结构化调试日志，支持两种调用方式，兼容飞书沙箱环境
 * @param {string | object} stepOrData - 日志步骤描述或日志对象
 * @param {any} data - 日志数据（可选）
 * @param {string} logID - 日志ID，从context中获取（可选）
 */
function debugLog(stepOrData: string | object, data?: any, logID?: string) {
    // 格式化时间戳为易读格式：2025-10-18 10:02:14
    const now = new Date();

    // 手动补零函数（避免 padStart 兼容性问题）
    const pad = (num: number, size: number = 2): string => {
        let s = String(num);
        while (s.length < size) { s = '0' + s; }
        return s;
    };

    const timestamp = now.getFullYear() + '-' +
        pad(now.getMonth() + 1) + '-' +
        pad(now.getDate()) + ' ' +
        pad(now.getHours()) + ':' +
        pad(now.getMinutes()) + ':' +
        pad(now.getSeconds());

    let logData: any = {
        timestamp: timestamp
    };

    // 如果提供了 logID，添加到日志数据中
    if (logID) {
        logData.logID = logID;
    }

    // 如果第一个参数是对象，直接使用（兼容旧的调用方式）
    if (typeof stepOrData === 'object') {
        logData = {
            ...logData,
            ...stepOrData
        };
    } else {
        // 如果第一个参数是字符串，作为 step
        logData.step = stepOrData;
        if (data !== undefined) {
            logData.data = data;
        }
    }

}


/**
 * 3.3 构建API请求体
 * @param {Object} params - 用户输入参数
 * @param {string} logID - 日志ID，从context中获取（可选）
 * @returns {Object} 标准化的API请求体
 */
function buildRequestBody(params: any, logID?: string): any {
    const { model, message, system_prompt, attachment } = params;

    // 处理模型参数：有输入就传递，没有就不传递该字段
    const processedModel = model && typeof model === 'string' && model.trim() ? model.trim() : null;

    // 处理系统提示词参数：有输入就传递，没有就不传递该字段
    const processedSystemPrompt = system_prompt && typeof system_prompt === 'string' && system_prompt.trim() 
        ? system_prompt.trim() 
        : null;

    // 处理用户消息：必须提供message参数
    const processedMessage = message && typeof message === 'string' && message.trim() 
        ? message.trim() 
        : '';

    // 处理附件：兼容一维数组、二维数组和单个对象
    // 将所有附件信息完整提取并传递给后端
    let processedAttachments: any[] = [];
    
    if (attachment) {
        if (Array.isArray(attachment) && attachment.length > 0) {
            // 检查是否是二维数组（嵌套数组）
            const firstItem = attachment[0];
            if (Array.isArray(firstItem)) {
                // 二维数组：展平并提取所有附件对象
                for (const subArray of attachment) {
                    if (Array.isArray(subArray)) {
                        for (const item of subArray) {
                            if (item && typeof item === 'object' && item.tmp_url) {
                                // 提取完整的附件信息
                                processedAttachments.push({
                                    tmp_url: item.tmp_url,
                                    name: item.name || '',
                                    type: item.type || '',
                                    size: item.size || 0
                                });
                            }
                        }
                    }
                }
            } else {
                // 一维数组：直接提取附件对象
                for (const item of attachment) {
                    if (item && typeof item === 'object' && item.tmp_url) {
                        // 提取完整的附件信息
                        processedAttachments.push({
                            tmp_url: item.tmp_url,
                            name: item.name || '',
                            type: item.type || '',
                            size: item.size || 0
                        });
                    }
                }
            }
        } else if (typeof attachment === 'object' && attachment.tmp_url) {
            // 单个附件对象
            processedAttachments.push({
                tmp_url: attachment.tmp_url,
                name: attachment.name || '',
                type: attachment.type || '',
                size: attachment.size || 0
            });
        }
        
        // 记录附件处理结果
        if (processedAttachments.length > 0) {
            debugLog('=== 处理附件 ===', {
                originalAttachmentType: Array.isArray(attachment) 
                    ? (Array.isArray(attachment[0]) ? '二维数组' : '一维数组')
                    : '单个对象',
                processedCount: processedAttachments.length,
                attachments: processedAttachments.map((att: any) => ({
                    name: att.name,
                    type: att.type,
                    size: att.size,
                    urlPreview: att.tmp_url ? att.tmp_url.substring(0, 50) + '...' : ''
                }))
            }, logID);
        }
    }

    // 构建请求体
    const requestBody: any = {};
    
    // 只有当model有值时才添加到请求体中
    if (processedModel) {
        requestBody.model = processedModel;
    }
    
    // 只有当system_prompt有值时才添加到请求体中
    if (processedSystemPrompt) {
        requestBody.system_prompt = processedSystemPrompt;
    }

    // 添加用户消息（必需字段）
    requestBody.message = processedMessage;

    // 将所有附件信息完整传递给后端（包括 tmp_url, name, type, size）
    if (processedAttachments.length > 0) {
        processedAttachments = processedAttachments.map(item => ({
            ...item,
            type: item.type === 'image' ? 'image/jpeg' : item.type
        }));
        requestBody.attachment = processedAttachments;
    }

    return requestBody;
}



export default fieldDecoratorKit;
