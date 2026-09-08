package com.kemkendra.document.storage;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

@Service
public class LocalStorageService implements StorageService {

    private final Path rootLocation;

    public LocalStorageService(@Value("${kemkendra.storage.local.root}") String root) {
        if (!StringUtils.hasText(root)) {
            throw new IllegalArgumentException("Local storage root cannot be empty");
        }
        this.rootLocation = Paths.get(root).toAbsolutePath().normalize();
    }

    @PostConstruct
    public void init() {
        try {
            Files.createDirectories(this.rootLocation);
        } catch (IOException e) {
            throw new RuntimeException("Could not initialize storage location", e);
        }
    }

    private Path resolveSafePath(String key) {
        if (!StringUtils.hasText(key)) {
            throw new IllegalArgumentException("Storage key cannot be empty");
        }
        
        // Strip leading slashes to prevent absolute path escapes on Unix/Linux
        String sanitizedKey = key.replace('\\', '/').replaceAll("^/+", "");
        Path targetPath = this.rootLocation.resolve(sanitizedKey).normalize();
        
        // Prevent path traversal
        if (!targetPath.startsWith(this.rootLocation)) {
            throw new IllegalArgumentException("Cannot store file outside current directory");
        }
        
        return targetPath;
    }

    @Override
    public void store(String key, InputStream content) {
        Path targetLocation = resolveSafePath(key);
        
        try {
            // Ensure parent directory exists for keys that might contain slashes
            Files.createDirectories(targetLocation.getParent());
            Files.copy(content, targetLocation, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file with key " + key, e);
        }
    }

    @Override
    public void delete(String key) {
        try {
            Path targetLocation = resolveSafePath(key);
            Files.deleteIfExists(targetLocation);
        } catch (Exception e) {
            // Silently ignore or log - deleting non-existent file shouldn't throw
        }
    }

    @Override
    public boolean exists(String key) {
        try {
            if (!StringUtils.hasText(key)) {
                return false;
            }
            Path targetLocation = resolveSafePath(key);
            return Files.exists(targetLocation);
        } catch (Exception e) {
            return false;
        }
    }

    @Override
    public Resource loadAsResource(String key) {
        Path targetLocation = resolveSafePath(key);
        try {
            Resource resource = new UrlResource(targetLocation.toUri());
            if (resource.exists() || resource.isReadable()) {
                return resource;
            } else {
                throw new RuntimeException("Could not read file with key " + key);
            }
        } catch (java.net.MalformedURLException e) {
            throw new RuntimeException("Could not read file with key " + key, e);
        }
    }
}
