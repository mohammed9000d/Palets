<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use App\Models\Setting;

class SettingController extends Controller
{
    /**
     * Get all settings
     */
    public function index()
    {
        try {
            $settings = Setting::getAllSettings();
            
            // Add default values for missing settings
            $defaultSettings = [
                'site_name' => config('app.name', 'Palets'),
                'site_description' => 'Art Gallery Management System',
                'logo' => null,
                'favicon' => null,
                'dark_mode' => false,
            ];

            // Merge with existing settings
            $allSettings = array_merge($defaultSettings, $settings);

            return response()->json([
                'success' => true,
                'data' => $allSettings
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch settings',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update settings
     */
    public function update(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'site_name' => 'nullable|string|max:255',
                'site_description' => 'nullable|string|max:1000',
                'logo' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
                'favicon' => 'nullable|image|mimes:ico,png,jpg,gif,svg|max:1024',
                'dark_mode' => 'nullable|boolean',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $updatedSettings = [];

            // Handle text settings
            if ($request->has('site_name')) {
                Setting::set('site_name', $request->site_name, 'string', 'Website name');
                $updatedSettings['site_name'] = $request->site_name;
            }

            if ($request->has('site_description')) {
                Setting::set('site_description', $request->site_description, 'string', 'Website description');
                $updatedSettings['site_description'] = $request->site_description;
            }

            if ($request->has('dark_mode')) {
                Setting::set('dark_mode', $request->dark_mode, 'boolean', 'Dark mode toggle');
                $updatedSettings['dark_mode'] = (bool) $request->dark_mode;
            }

            // Handle file uploads
            if ($request->hasFile('logo')) {
                $logoPath = $this->handleFileUpload($request->file('logo'), 'logos');
                if ($logoPath) {
                    // Delete old logo if exists
                    $oldLogo = Setting::get('logo');
                    if ($oldLogo && Storage::exists(str_replace('/storage/', '', $oldLogo))) {
                        Storage::delete(str_replace('/storage/', '', $oldLogo));
                    }
                    
                    Setting::set('logo', $logoPath, 'file', 'Website logo');
                    $updatedSettings['logo'] = Storage::url($logoPath);
                }
            }

            if ($request->hasFile('favicon')) {
                $faviconPath = $this->handleFileUpload($request->file('favicon'), 'favicons');
                if ($faviconPath) {
                    // Delete old favicon if exists
                    $oldFavicon = Setting::get('favicon');
                    if ($oldFavicon && Storage::exists(str_replace('/storage/', '', $oldFavicon))) {
                        Storage::delete(str_replace('/storage/', '', $oldFavicon));
                    }
                    
                    Setting::set('favicon', $faviconPath, 'file', 'Website favicon');
                    $updatedSettings['favicon'] = Storage::url($faviconPath);
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Settings updated successfully',
                'data' => $updatedSettings
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update settings',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get public settings (for frontend)
     */
    public function getPublicSettings()
    {
        try {
            $publicSettings = [
                'site_name' => Setting::get('site_name', config('app.name', 'Palets')),
                'site_description' => Setting::get('site_description', 'Art Gallery Management System'),
                'logo' => Setting::get('logo'),
                'favicon' => Setting::get('favicon'),
                'dark_mode' => Setting::get('dark_mode', false),
            ];

            return response()->json([
                'success' => true,
                'data' => $publicSettings
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch public settings',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Handle file upload
     */
    private function handleFileUpload($file, $folder)
    {
        try {
            $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs($folder, $filename, 'public');
            return $path;
        } catch (\Exception $e) {
            return null;
        }
    }

    /**
     * Delete a file setting
     */
    public function deleteFile(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'key' => 'required|string|in:logo,favicon'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid file key',
                    'errors' => $validator->errors()
                ], 422);
            }

            $key = $request->key;
            $currentFile = Setting::get($key);
            
            if ($currentFile) {
                // Delete file from storage
                $filePath = str_replace('/storage/', '', $currentFile);
                if (Storage::exists($filePath)) {
                    Storage::delete($filePath);
                }
                
                // Remove setting
                Setting::where('key', $key)->delete();
            }

            return response()->json([
                'success' => true,
                'message' => ucfirst($key) . ' deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete file',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
