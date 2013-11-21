(SELECT DISTINCT `reporter` AS `contributor`
	FROM `ticket`
	WHERE `resolution` = "fixed"
		AND `milestone` = $V)
UNION
(SELECT DISTINCT `author`
	FROM `ticket_change`
	WHERE `ticket` IN (
		SELECT `id`
			FROM `ticket`
			WHERE `resolution` = "fixed"
			AND `milestone` = $V))
ORDER BY CAST(`contributor` AS CHAR)
