package com.bodyslim.app;

import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.util.Base64;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import com.google.android.gms.tasks.Tasks;
import com.google.mlkit.vision.common.InputImage;
import com.google.mlkit.vision.face.Face;
import com.google.mlkit.vision.face.FaceDetection;
import com.google.mlkit.vision.face.FaceDetector;
import com.google.mlkit.vision.face.FaceDetectorOptions;

import java.util.List;

@CapacitorPlugin(name = "BodySlim")
public class BodySlimPlugin extends Plugin {

    private FaceDetector detector;

    private FaceDetector getDetector() {
        if (detector == null) {
            FaceDetectorOptions opts = new FaceDetectorOptions.Builder()
                    .setPerformanceMode(FaceDetectorOptions.PERFORMANCE_MODE_FAST)
                    .setMinFaceSize(0.08f)
                    .build();
            detector = FaceDetection.getClient(opts);
        }
        return detector;
    }

    @PluginMethod
    public void detectFaces(PluginCall call) {
        String base64 = call.getString("image", "");
        if (base64 == null || base64.isEmpty()) {
            call.reject("Missing image parameter");
            return;
        }

        try {
            if (base64.contains(",")) {
                base64 = base64.substring(base64.indexOf(",") + 1);
            }
            byte[] bytes = Base64.decode(base64, Base64.DEFAULT);
            Bitmap bitmap = BitmapFactory.decodeByteArray(bytes, 0, bytes.length);
            if (bitmap == null) {
                call.reject("Failed to decode image");
                return;
            }

            InputImage input = InputImage.fromBitmap(bitmap, 0);
            List<Face> faces = Tasks.await(getDetector().process(input));

            float w = bitmap.getWidth();
            float h = bitmap.getHeight();

            JSArray facesArray = new JSArray();
            for (Face face : faces) {
                JSObject faceObj = new JSObject();
                faceObj.put("left",   face.getBoundingBox().left   / w);
                faceObj.put("top",    face.getBoundingBox().top    / h);
                faceObj.put("right",  face.getBoundingBox().right  / w);
                faceObj.put("bottom", face.getBoundingBox().bottom / h);
                facesArray.put(faceObj);
            }

            JSObject result = new JSObject();
            result.put("count", faces.size());
            result.put("faces", facesArray);
            call.resolve(result);

        } catch (Exception e) {
            call.reject("Face detection failed: " + e.getMessage());
        }
    }
}
