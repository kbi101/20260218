package com.pao.exception;

public class QuotaExceededException extends RuntimeException {
    private final String prompt;

    public QuotaExceededException(String message, String prompt) {
        super(message);
        this.prompt = prompt;
    }

    public String getPrompt() {
        return prompt;
    }
}
