import { createParamDecorator } from '@/common/application';

const CurUser = createParamDecorator(ctx => {
  return ctx.state.curUser;
});

export default CurUser;
