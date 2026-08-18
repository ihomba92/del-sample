from marshmallow import Schema, fields, validate

from ..constants import ROLE_CUSTOMER, USER_ROLES


class UserSchema(Schema):
    id = fields.Int(dump_only=True)
    name = fields.Str(required=True, validate=validate.Length(min=2, max=120))
    email = fields.Email(required=True)
    phone = fields.Str(allow_none=True, validate=validate.Length(max=24))
    role = fields.Str(dump_only=True)
    is_active = fields.Bool(dump_only=True)
    vehicle = fields.Str(allow_none=True)
    current_lat = fields.Float(allow_none=True)
    current_lng = fields.Float(allow_none=True)
    last_seen_at = fields.DateTime(dump_only=True)
    created_at = fields.DateTime(dump_only=True)


class UserSummarySchema(Schema):
    id = fields.Int()
    name = fields.Str()
    email = fields.Email()
    phone = fields.Str()
    role = fields.Str()
    vehicle = fields.Str()
    current_lat = fields.Float()
    current_lng = fields.Float()


class RegisterSchema(Schema):
    name = fields.Str(required=True, validate=validate.Length(min=2, max=120))
    email = fields.Email(required=True)
    phone = fields.Str(load_default=None, validate=validate.Length(max=24))
    password = fields.Str(
        required=True,
        load_only=True,
        validate=validate.Length(min=8, error="Password must be at least 8 characters"),
    )
    role = fields.Str(load_default=ROLE_CUSTOMER, validate=validate.OneOf(USER_ROLES))


class LoginSchema(Schema):
    email = fields.Email(required=True)
    password = fields.Str(required=True, load_only=True)


class ProfileUpdateSchema(Schema):
    name = fields.Str(validate=validate.Length(min=2, max=120))
    phone = fields.Str(allow_none=True, validate=validate.Length(max=24))
    vehicle = fields.Str(allow_none=True, validate=validate.Length(max=60))


class AdminUserUpdateSchema(Schema):
    role = fields.Str(validate=validate.OneOf(USER_ROLES))
    is_active = fields.Bool()


user_schema = UserSchema()
user_summary_schema = UserSummarySchema()
register_schema = RegisterSchema()
login_schema = LoginSchema()
profile_update_schema = ProfileUpdateSchema()
admin_user_update_schema = AdminUserUpdateSchema()
