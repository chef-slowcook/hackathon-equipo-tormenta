# Build context must be the project root (set via docker-compose)
# Stage 1 – install dependencies with uv
FROM python:3.14-slim AS builder

COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

ENV UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy \
    UV_PROJECT_ENVIRONMENT=/app/.venv

WORKDIR /app

COPY Backend/pyproject.toml Backend/uv.lock ./
RUN uv sync --frozen --no-install-project --no-dev

# Stage 2 – runtime image
FROM python:3.14-slim

ENV PATH="/app/.venv/bin:$PATH" \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    ML_SRC=/app/ML/src \
    MODELS_PATH=/app/ML/notebooks/modelling/models

WORKDIR /app

COPY --from=builder /app/.venv /app/.venv

COPY ML/src/ ./ML/src/
COPY ML/notebooks/modelling/models/ ./ML/notebooks/modelling/models/

COPY Backend/main.py Backend/simulator.py ./

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
