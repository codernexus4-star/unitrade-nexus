from django.contrib import admin
from .models import University, Campus, User, EmailVerification, PushToken, NotificationLog
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _

@admin.register(University)
class UniversityAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)

@admin.register(Campus)
class CampusAdmin(admin.ModelAdmin):
    list_display = ('name', 'university')
    list_filter = ('university',)
    search_fields = ('name',)

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        (_('Personal info'), {'fields': ('first_name', 'last_name', 'phone_number', 'location', 'bio', 'profile_picture')}),
        (_('Academic info'), {'fields': ('university', 'campus', 'student_id', 'level', 'program_of_study')}),
        (_('Seller info'), {'fields': ('role', 'seller_type', 'business_name', 'business_description')}),
        (_('Permissions'), {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        (_('Important dates'), {'fields': ('last_login', 'date_joined')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password1', 'password2'),
        }),
    )
    list_display = ('email', 'first_name', 'last_name', 'role', 'seller_type', 'university', 'campus', 'is_staff')
    list_filter = ('role', 'seller_type', 'university', 'campus', 'is_staff', 'is_superuser', 'is_active')
    search_fields = ('email', 'first_name', 'last_name', 'student_id', 'business_name')
    ordering = ('email',)

admin.site.register(EmailVerification)


@admin.register(PushToken)
class PushTokenAdmin(admin.ModelAdmin):
    list_display = ('user', 'device_type', 'is_active', 'created_at', 'token_preview')
    list_filter = ('device_type', 'is_active', 'created_at')
    search_fields = ('user__email', 'user__first_name', 'user__last_name', 'token')
    readonly_fields = ('created_at', 'updated_at')
    date_hierarchy = 'created_at'
    
    def token_preview(self, obj):
        return f"{obj.token[:30]}..." if len(obj.token) > 30 else obj.token
    token_preview.short_description = 'Token Preview'
    
    actions = ['deactivate_tokens', 'activate_tokens']
    
    def deactivate_tokens(self, request, queryset):
        updated = queryset.update(is_active=False)
        self.message_user(request, f'{updated} tokens deactivated.')
    deactivate_tokens.short_description = 'Deactivate selected tokens'
    
    def activate_tokens(self, request, queryset):
        updated = queryset.update(is_active=True)
        self.message_user(request, f'{updated} tokens activated.')
    activate_tokens.short_description = 'Activate selected tokens'


@admin.register(NotificationLog)
class NotificationLogAdmin(admin.ModelAdmin):
    list_display = ('user', 'type', 'title', 'successful', 'sent_to_tokens', 'created_at')
    list_filter = ('type', 'successful', 'created_at')
    search_fields = ('user__email', 'user__first_name', 'user__last_name', 'title', 'body')
    readonly_fields = ('user', 'type', 'title', 'body', 'data', 'sent_to_tokens', 'successful', 'error_message', 'created_at')
    date_hierarchy = 'created_at'
    
    def has_add_permission(self, request):
        return False  # Don't allow manual creation
    
    def has_change_permission(self, request, obj=None):
        return False  # Read-only
