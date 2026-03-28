package com.syntaxtype.demo.Service.users;

import com.syntaxtype.demo.DTO.statistics.LeaderboardEntry;
import com.syntaxtype.demo.DTO.users.StudentProgressDTO;
import com.syntaxtype.demo.DTO.users.UserDTO;
import com.syntaxtype.demo.DTO.users.TeacherDTO;
import com.syntaxtype.demo.Entity.Enums.Role;
import com.syntaxtype.demo.Entity.Statistics.Leaderboard;
import com.syntaxtype.demo.Entity.Statistics.UserStatistics;
import com.syntaxtype.demo.Entity.Users.Teacher;
import com.syntaxtype.demo.Entity.Users.User;
import com.syntaxtype.demo.Repository.statistics.LeaderboardRepository;
import com.syntaxtype.demo.Repository.statistics.ScoringRepository;
import com.syntaxtype.demo.Repository.statistics.UserStatisticsRepository;
import com.syntaxtype.demo.Repository.users.TeacherRepository;
import com.syntaxtype.demo.Repository.users.UserRepository;
import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TeacherService {
    private final TeacherRepository teacherRepository;
    private final UserRepository userRepository;
    private final LeaderboardRepository leaderboardRepository;
    private final UserStatisticsRepository userStatisticsRepository;
    private final ScoringRepository scoringRepository;
    private final UserService userService; // Inject UserService

    public List<TeacherDTO> findAll() {
        return teacherRepository.findAll().stream()
                .map(this::convertToDTO)
                .toList();
    }

    public Optional<TeacherDTO> findByTeacherId(Long teacherId) {
        return teacherRepository.findById(teacherId)
                .map(this::convertToDTO);
    }

    public Optional<TeacherDTO> findByUser(User user) {
        return teacherRepository.findByUser(user)
                .map(this::convertToDTO);
    }

    public List<TeacherDTO> findByFirstName(String firstName) {
        return teacherRepository.findByFirstName(firstName).stream()
                .map(this::convertToDTO)
                .toList();
    }

    public List<TeacherDTO> findByLastName(String lastName) {
        return teacherRepository.findByLastName(lastName).stream()
                .map(this::convertToDTO)
                .toList();
    }

    public List<TeacherDTO> findByInstitution(String institution) {
        return teacherRepository.findByInstitution(institution).stream()
                .map(this::convertToDTO)
                .toList();
    }

    public List<TeacherDTO> findBySubject(String subject) {
        return teacherRepository.findBySubject(subject).stream()
                .map(this::convertToDTO)
                .toList();
    }

    public Optional<TeacherDTO> findByUserId(Long userId) {
        return teacherRepository.findByUser_UserId(userId)
                .map(this::convertToDTO);
    }

    public TeacherDTO save(TeacherDTO teacherDTO, User user) {
        Teacher teacher = convertFromDTO(teacherDTO, user);
        return convertToDTO(teacherRepository.save(teacher));
    }

    // PATCH: Update teacher's first name
    public TeacherDTO updateFirstName(Long teacherId, String newFirstName) {
        Optional<Teacher> teacherOpt = teacherRepository.findById(teacherId);
        if (teacherOpt.isPresent()) {
            Teacher teacher = teacherOpt.get();
            teacher.setFirstName(newFirstName);
            return convertToDTO(teacherRepository.save(teacher));
        }
        return null;
    }

    // PATCH: Update teacher's last name
    public TeacherDTO updateLastName(Long teacherId, String newLastName) {
        Optional<Teacher> teacherOpt = teacherRepository.findById(teacherId);
        if (teacherOpt.isPresent()) {
            Teacher teacher = teacherOpt.get();
            teacher.setLastName(newLastName);
            return convertToDTO(teacherRepository.save(teacher));
        }
        return null;
    }

    // PATCH: Update teacher's institution
    public TeacherDTO updateInstitution(Long teacherId, String newInstitution) {
        Optional<Teacher> teacherOpt = teacherRepository.findById(teacherId);
        if (teacherOpt.isPresent()) {
            Teacher teacher = teacherOpt.get();
            teacher.setInstitution(newInstitution);
            return convertToDTO(teacherRepository.save(teacher));
        }
        return null;
    }

    // PATCH: Update teacher's subject
    public TeacherDTO updateSubject(Long teacherId, String newSubject) {
        Optional<Teacher> teacherOpt = teacherRepository.findById(teacherId);
        if (teacherOpt.isPresent()) {
            Teacher teacher = teacherOpt.get();
            teacher.setSubject(newSubject);
            return convertToDTO(teacherRepository.save(teacher));
        }
        return null;
    }

    public void deleteById(Long teacherId) {
        teacherRepository.deleteById(teacherId);
    }

    /**
     * Get all students with their progress information.
     * Used for the teacher dashboard overview.
     *
     * @return List of StudentProgressDTO for all students
     */
    public List<StudentProgressDTO> getAllStudentsWithProgress() {
        List<User> students = userRepository.findByUserRole(Role.STUDENT);
        
        return students.stream()
                .map(this::buildStudentProgressDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get detailed progress for a specific student.
     *
     * @param studentId The user ID of the student
     * @return StudentProgressDTO with detailed information, or null if not found
     */
    public StudentProgressDTO getStudentProgress(Long studentId) {
        Optional<User> studentOpt = userRepository.findByUserId(studentId);
        
        if (studentOpt.isEmpty()) {
            return null;
        }
        
        User student = studentOpt.get();
        
        // Verify the user is a student
        if (student.getUserRole() != Role.STUDENT) {
            return null;
        }
        
        return buildStudentProgressDTO(student);
    }

    /**
     * Get class leaderboard with all students ranked by combined score.
     * Combines WPM and accuracy to calculate a unified score.
     *
     * @return List of LeaderboardEntry sorted by combined score descending
     */
    public List<LeaderboardEntry> getClassLeaderboard() {
        List<User> students = userRepository.findByUserRole(Role.STUDENT);
        
        List<LeaderboardEntry> entries = new ArrayList<>();
        int rank = 1;
        
        for (User student : students) {
            List<Leaderboard> leaderboardEntries = leaderboardRepository.findAllByUserId(student.getUserId());
            
            if (!leaderboardEntries.isEmpty()) {
                // Get the best combined score across all categories
                Leaderboard bestEntry = leaderboardEntries.stream()
                        .max(Comparator.comparingDouble(lb -> {
                            return LeaderboardEntry.calculateCombinedScore(
                                    lb.getWordsPerMinute(), 
                                    lb.getAccuracy()
                            );
                        }))
                        .orElse(null);
                
                if (bestEntry != null) {
                    Double combinedScore = LeaderboardEntry.calculateCombinedScore(
                            bestEntry.getWordsPerMinute(),
                            bestEntry.getAccuracy()
                    );
                    
                    LeaderboardEntry entry = LeaderboardEntry.builder()
                            .rank(rank++)
                            .username(student.getUsername())
                            .score(combinedScore)
                            .wpm(bestEntry.getWordsPerMinute())
                            .accuracy(bestEntry.getAccuracy())
                            .gameName(bestEntry.getCategory() != null ? bestEntry.getCategory().name() : null)
                            .dateAchieved(null)
                            .build();
                    
                    entries.add(entry);
                }
            }
        }
        
        // Sort by combined score descending
        entries.sort((a, b) -> Double.compare(b.getScore(), a.getScore()));
        
        // Re-assign ranks after sorting
        for (int i = 0; i < entries.size(); i++) {
            entries.get(i).setRank(i + 1);
        }
        
        return entries;
    }

    /**
     * Build a StudentProgressDTO from a User entity.
     * Aggregates data from Leaderboard, UserStatistics, and Scoring tables.
     *
     * @param student The student User entity
     * @return StudentProgressDTO with aggregated data
     */
    private StudentProgressDTO buildStudentProgressDTO(User student) {
        Long studentId = student.getUserId();
        
        // Get best scores per category from Leaderboard
        List<Leaderboard> leaderboardEntries = leaderboardRepository.findAllByUserId(studentId);
        Map<String, Integer> bestScores = new LinkedHashMap<>();
        
        for (Leaderboard lb : leaderboardEntries) {
            if (lb.getCategory() != null) {
                Double combinedScore = LeaderboardEntry.calculateCombinedScore(
                        lb.getWordsPerMinute(),
                        lb.getAccuracy()
                );
                bestScores.put(lb.getCategory().name(), combinedScore.intValue());
            }
        }
        
        // Get aggregate stats from UserStatistics
        Optional<UserStatistics> statsOpt = userStatisticsRepository.findByUser(student);
        Double averageWpm = 0.0;
        Double averageAccuracy = 0.0;
        
        if (statsOpt.isPresent()) {
            UserStatistics stats = statsOpt.get();
            averageWpm = stats.getWordsPerMinute() != null ? stats.getWordsPerMinute().doubleValue() : 0.0;
            averageAccuracy = stats.getAccuracy() != null ? stats.getAccuracy().doubleValue() : 0.0;
        }
        
        // Get recent activity from Scoring table (last 10)
        List<com.syntaxtype.demo.Entity.Statistics.Scoring> recentScoring = scoringRepository.findByUser(student);
        List<StudentProgressDTO.RecentActivity> recentActivity = recentScoring.stream()
                .limit(10)
                .map(s -> StudentProgressDTO.RecentActivity.builder()
                        .activityId(s.getScoringId())
                        .category(s.getCategory() != null ? s.getCategory().name() : null)
                        .wpm(null) // Scoring doesn't have WPM, it's for challenge games
                        .accuracy(null) // Scoring doesn't have accuracy
                        .score(s.getTotalScore())
                        .playedAt(null) // Scoring doesn't have timestamp, would need to add
                        .build())
                .collect(Collectors.toList());
        
        // Count total games played (sum of leaderboard + scoring entries)
        int totalGamesPlayed = leaderboardEntries.size() + recentScoring.size();
        
        return StudentProgressDTO.builder()
                .studentId(studentId)
                .username(student.getUsername())
                .email(student.getEmail())
                .totalGamesPlayed(totalGamesPlayed)
                .averageWpm(averageWpm)
                .averageAccuracy(averageAccuracy)
                .bestScores(bestScores)
                .recentActivity(recentActivity)
                .build();
    }

    public TeacherDTO convertToDTO(Teacher teacher) {
        if (teacher == null) return null;

        UserDTO userDTO = null;
        if (teacher.getUser() != null) {
            userDTO = userService.convertToDTO(teacher.getUser());
            if (userDTO != null) {
                userDTO.setPassword(null); // Ensure password is not sent to frontend
            }
        }
        return TeacherDTO.builder()
                .teacherId(teacher.getTeacherId())
                .user(userDTO)
                .firstName(teacher.getFirstName())
                .lastName(teacher.getLastName())
                .institution(teacher.getInstitution())
                .subject(teacher.getSubject())
                .build();
    }

    public Teacher convertFromDTO(TeacherDTO teacherDTO, User user) {
        if (teacherDTO == null) return null;
        Teacher teacher = new Teacher();
        teacher.setTeacherId(teacherDTO.getTeacherId());
        teacher.setUser(user);
        teacher.setFirstName(teacherDTO.getFirstName());
        teacher.setLastName(teacherDTO.getLastName());
        teacher.setInstitution(teacherDTO.getInstitution());
        teacher.setSubject(teacherDTO.getSubject());
        return teacher;
    }
}