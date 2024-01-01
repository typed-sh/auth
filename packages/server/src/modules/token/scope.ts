/* eslint-disable new-cap */
import {Type} from '@sinclair/typebox';

export enum Scope {
	UserRead = 'user.read',
	UserWrite = 'user.write',
}

export const scopeSchema = Type.Enum(Scope);
