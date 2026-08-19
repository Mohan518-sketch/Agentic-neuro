import sys
from pyngrok import ngrok
public_url = ngrok.connect(8000, "http").public_url
print(f"PUBLIC_URL: {public_url}")
# Keep it alive
try:
    ngrok.get_ngrok_process().join()
except KeyboardInterrupt:
    ngrok.kill()
