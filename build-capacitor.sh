
#!/bin/bash

echo "🚀 Building Next.js for Capacitor..."

# Build Next.js with Capacitor config
NEXT_CONFIG_FILE=next.config.capacitor.js yarn build

echo "✅ Next.js build complete!"

# Copy static files
echo "📦 Syncing with Capacitor..."
npx cap sync android

echo "✅ Android project ready!"
echo ""
echo "📱 Next steps:"
echo "1. Open Android Studio"
echo "2. Open folder: $(pwd)/android"
echo "3. Wait for Gradle sync"
echo "4. Click 'Build' → 'Generate Signed Bundle/APK'"
echo "5. Choose 'APK' → Click 'Next'"
echo "6. Create or select keystore"
echo "7. Build release APK"
echo ""
echo "🎉 Done! Your APK will be in: android/app/build/outputs/apk/release/"
