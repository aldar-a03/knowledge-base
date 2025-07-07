package com.example.itsupport.dto.attachment;

import com.example.itsupport.entity.Attachment;
import org.springframework.core.io.Resource;

public record ResourceWithMeta(Resource resource, Attachment meta) {

}
