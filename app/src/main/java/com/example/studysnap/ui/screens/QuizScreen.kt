package com.example.studysnap.ui.screens

import androidx.compose.animation.*
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.studysnap.model.Quiz
import com.example.studysnap.ui.theme.*
import com.example.studysnap.ui.viewmodel.StudySnapViewModel

@Composable
fun QuizScreen(
    viewModel: StudySnapViewModel,
    modifier: Modifier = Modifier
) {
    val quizzes by viewModel.quizzes.collectAsState()
    val selectedAnswers by viewModel.selectedAnswers.collectAsState()
    val quizResults by viewModel.quizResults.collectAsState()

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .testTag("quiz_screen"),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Text(
                text = "Daily Knowledge Quizzes",
                style = MaterialTheme.typography.headlineMedium,
                fontWeight = FontWeight.Black
            )
            Text(
                text = "Test your grasp on high-yield exam concepts and earn +20 points!",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }

        items(quizzes) { quiz ->
            QuizItemCard(
                quiz = quiz,
                selectedOption = selectedAnswers[quiz.id],
                result = quizResults[quiz.id],
                onSelectOption = { viewModel.selectQuizOption(quiz.id, it) },
                onSubmit = { viewModel.submitQuiz(quiz.id) }
            )
        }
    }
}

@Composable
fun QuizItemCard(
    quiz: Quiz,
    selectedOption: Int?,
    result: Boolean?,
    onSelectOption: (Int) -> Unit,
    onSubmit: () -> Unit
) {
    val isSubmitted = (result != null)

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .testTag("quiz_card_${quiz.id}"),
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surface
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(18.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Surface(
                    shape = RoundedCornerShape(8.dp),
                    color = PurpleAccent.copy(alpha = 0.15f)
                ) {
                    Text(
                        text = quiz.subject.uppercase(),
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Black,
                        fontFamily = FontFamily.Monospace,
                        color = PurpleAccent,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                    )
                }

                Surface(
                    shape = RoundedCornerShape(8.dp),
                    color = EmeraldSuccess.copy(alpha = 0.15f)
                ) {
                    Text(
                        text = "+${quiz.points} PTS",
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Black,
                        fontFamily = FontFamily.Monospace,
                        color = EmeraldSuccess,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            Text(
                text = quiz.question,
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onSurface
            )

            Spacer(modifier = Modifier.height(14.dp))

            // Options List
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                quiz.options.forEachIndexed { index, optionText ->
                    val isSelected = (selectedOption == index)
                    val isCorrectOption = (quiz.correctAnswer == index)

                    val backgroundColor = when {
                        isSubmitted && isCorrectOption -> Color(0xFFDCFCE7)
                        isSubmitted && isSelected && !isCorrectOption -> Color(0xFFFEE2E2)
                        isSelected -> BluePrimary.copy(alpha = 0.1f)
                        else -> MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.4f)
                    }

                    val borderColor = when {
                        isSubmitted && isCorrectOption -> EmeraldSuccess
                        isSubmitted && isSelected && !isCorrectOption -> RoseError
                        isSelected -> BluePrimary
                        else -> Color.Transparent
                    }

                    Surface(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(12.dp))
                            .border(1.dp, borderColor, RoundedCornerShape(12.dp))
                            .clickable(enabled = !isSubmitted) {
                                onSelectOption(index)
                            },
                        color = backgroundColor,
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(horizontal = 14.dp, vertical = 10.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            RadioButton(
                                selected = isSelected,
                                onClick = if (!isSubmitted) { { onSelectOption(index) } } else null,
                                colors = RadioButtonDefaults.colors(selectedColor = BluePrimary),
                                enabled = !isSubmitted
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = optionText,
                                style = MaterialTheme.typography.bodyMedium,
                                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                                color = when {
                                    isSubmitted && isCorrectOption -> Color(0xFF166534)
                                    isSubmitted && isSelected && !isCorrectOption -> Color(0xFF991B1B)
                                    else -> MaterialTheme.colorScheme.onSurface
                                },
                                modifier = Modifier.weight(1f)
                            )
                            if (isSubmitted && isCorrectOption) {
                                Icon(
                                    Icons.Default.CheckCircle,
                                    contentDescription = "Correct",
                                    tint = EmeraldSuccess,
                                    modifier = Modifier.size(18.dp)
                                )
                            }
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            if (!isSubmitted) {
                Button(
                    onClick = onSubmit,
                    enabled = selectedOption != null,
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Text("Submit Answer", fontWeight = FontWeight.Bold)
                }
            } else {
                Surface(
                    shape = RoundedCornerShape(12.dp),
                    color = if (result == true) Color(0xFFDCFCE7) else Color(0xFFFEE2E2),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(12.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                imageVector = if (result == true) Icons.Default.CheckCircle else Icons.Default.Cancel,
                                contentDescription = null,
                                tint = if (result == true) EmeraldSuccess else RoseError,
                                modifier = Modifier.size(18.dp)
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = if (result == true) "Correct! +20 Points" else "Incorrect Answer",
                                fontWeight = FontWeight.Black,
                                fontSize = 13.sp,
                                color = if (result == true) Color(0xFF166534) else Color(0xFF991B1B)
                            )
                        }
                        if (quiz.explanation.isNotBlank()) {
                            Spacer(modifier = Modifier.height(6.dp))
                            Text(
                                text = "Explanation: ${quiz.explanation}",
                                fontSize = 12.sp,
                                color = MaterialTheme.colorScheme.onSurface
                            )
                        }
                    }
                }
            }
        }
    }
}
