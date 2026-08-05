import urllib.request
import json

BASE = "http://127.0.0.1:8000"

def post(path, payload):
    data = json.dumps(payload).encode()
    req = urllib.request.Request(
        BASE + path, data=data,
        headers={"Content-Type": "application/json"},
        method="POST"
    )
    resp = urllib.request.urlopen(req, timeout=5)
    return json.loads(resp.read().decode())

def get(path):
    resp = urllib.request.urlopen(BASE + path, timeout=5)
    return json.loads(resp.read().decode())

# Test POST /stream/source with webcam
r = post("/stream/source", {"source": "0"})
assert r.get("success") is True and r.get("camera_source") == "0", f"webcam source failed: {r}"
print("PASS  POST /stream/source (webcam)  ->", r)

# Test POST /stream/source with DroidCam URL
r = post("/stream/source", {"source": "http://192.168.1.15:4747/video"})
assert r.get("success") is True, f"droidcam source failed: {r}"
print("PASS  POST /stream/source (droidcam) ->", r)

# Test POST /stream/source with RTSP URL
r = post("/stream/source", {"source": "rtsp://user:pass@192.168.1.1/live"})
assert r.get("success") is True, f"rtsp source failed: {r}"
print("PASS  POST /stream/source (rtsp)    ->", r)

# Test POST /stream/source with mp4
r = post("/stream/source", {"source": "uploads/videos/demo.mp4"})
assert r.get("success") is True, f"mp4 source failed: {r}"
print("PASS  POST /stream/source (mp4)     ->", r)

# Reset to webcam
post("/stream/source", {"source": "0"})

# Test GET /stream/status
s = get("/stream/status")
assert "is_running" in s, f"status missing is_running: {s}"
assert "zones" in s, f"status missing zones: {s}"
assert "people_count" in s, f"status missing people_count: {s}"
print("PASS  GET /stream/status            ->", {k:v for k,v in s.items() if k in ("is_running","zones","people_count","fps","connection_status")})

# Test POST /stream/start
s = post("/stream/start", {})
assert s.get("is_running") is True, f"start failed: {s}"
print("PASS  POST /stream/start            ->", s.get("is_running"))

# Test POST /stream/stop
s = post("/stream/stop", {})
assert s.get("is_running") is False, f"stop failed: {s}"
print("PASS  POST /stream/stop             ->", s.get("is_running"))

print()
print("ALL ENDPOINT CHECKS PASSED")
