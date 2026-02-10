from fastapi import FastAPI
import uvicorn

from api.endpoints import router

app = FastAPI(
    title="Trading Model API",
    description="AI Trading Model API with Company-based stock predictions",
    version="1.0.0"
)

# Include your API routes
app.include_router(router, prefix="/api")

@app.get("/")
async def root():
    return {"message": "Trading Model API", "status": "healthy"}

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)