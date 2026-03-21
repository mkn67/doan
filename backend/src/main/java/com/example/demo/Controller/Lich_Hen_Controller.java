package com.example.demo.Controller;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.demo.Dto.DatLichRequest;
import com.example.demo.Service.LichHenService;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/lich-hen")
@RequiredArgsConstructor
@Tag(name= "Lịch Hẹn",description = "Các API liên quan đến đặt lịch khám bệnh"))
public class Lich_Hen_Controller {
    
}
