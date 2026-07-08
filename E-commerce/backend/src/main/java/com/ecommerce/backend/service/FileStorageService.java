package com.ecommerce.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Instant;

@Service
public class FileStorageService {

    private final Path root = Paths.get("uploads");

    public String storeProductImage(Long productId, MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IOException("File is empty");
        }

        String filename = StringUtils.cleanPath(file.getOriginalFilename());
        String ext = "";
        int idx = filename.lastIndexOf('.');
        if (idx > 0) ext = filename.substring(idx);

        String storedName = Instant.now().toEpochMilli() + ext;
        Path productDir = root.resolve("products").resolve(String.valueOf(productId));
        Files.createDirectories(productDir);

        Path target = productDir.resolve(storedName);
        Files.copy(file.getInputStream(), target);

        // Return a URL path that will be served by the resource handler
        return "/uploads/products/" + productId + "/" + storedName;
    }
}
