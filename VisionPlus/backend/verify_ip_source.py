import urllib.request, json
BASE = 'http://127.0.0.1:8000'
req = urllib.request.Request(BASE + '/stream/source', data=json.dumps({'source': 'http://10.10.68.173:4747/video'}).encode(), headers={'Content-Type': 'application/json'}, method='POST')
r = json.loads(urllib.request.urlopen(req, timeout=5).read())
print('POST /stream/source response:', r)
req2 = urllib.request.Request(BASE + '/stream/start', method='POST')
r2 = json.loads(urllib.request.urlopen(req2, timeout=5).read())
print('POST /stream/start response is_running:', r2.get('is_running'))
