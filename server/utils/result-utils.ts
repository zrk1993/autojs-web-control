export class ResultUtils {
  static success(msgOrData?: string | any, data?: object | string): object {
    if (data !== undefined || typeof msgOrData === 'string') {
      return { code: 200, message: msgOrData || '操作成功！', data: data || null };
    }
    return { code: 200, message: '操作成功！', data: msgOrData || null };
  }

  static badRequest(message: string, data?: any) {
    return { code: 400, message, data };
  }

  static forbidden(message: string, data?: any) {
    return { code: 403, message, data };
  }

  static internalServerError(message: string, data?: any) {
    return { code: 500, message, data };
  }
}
