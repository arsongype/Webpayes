package com.paymentplatform.auth.twofactor;

import com.warrenstrange.googleauth.ICredentialRepository;

import java.util.List;
import java.util.concurrent.ConcurrentHashMap;

public class InMemoryCredentialRepository implements ICredentialRepository {

    private final ConcurrentHashMap<String, String> credentials = new ConcurrentHashMap<>();

    @Override
    public String getSecretKey(String userId) {
        return credentials.get(userId);
    }

    @Override
    public void saveUserCredentials(String userId, String secretKey, int codeDigits, List<Integer> scratchCodes) {
        credentials.put(userId, secretKey);
    }
}
