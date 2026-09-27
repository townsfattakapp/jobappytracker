/**
 * Titles of the topics in library tracks whose content has not been written yet
 * ("Foundational topic 1 for Spark" … "Real-World topic 5 for Spark"). Forty-three
 * tracks consist only of these; nothing that a learner is pointed at should be one.
 */
export const PLACEHOLDER_TOPIC = /^(foundational|intermediate|advanced|architecture|real-world|core|practice) (topic|concepts?) \d+ for\b/i

export function isPlaceholderTopic(title: string): boolean {
  return PLACEHOLDER_TOPIC.test(title)
}
