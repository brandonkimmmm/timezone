import { IResolvers } from '@graphql-tools/utils';
import { merge } from 'lodash';
import { UserResolvers } from './user.resolver';
import { AdminResolvers } from './admin.resolver';

export const userResolvers: IResolvers = merge(UserResolvers);
export const adminResolvers: IResolvers = merge(AdminResolvers);
