from model import analyze_code

result = analyze_code(
    '''def divide(a,b):
    return a/b
password="admin123"
x=[]
print(x[5])''',
    'python'
)

print('Total suggestions:', len(result['suggestions']))
print()

for i, s in enumerate(result['suggestions']):
    rc = s.get('refactoredCode', '')
    print(
        f'Suggestion {i+1}: '
        f'severity={s["severity"]} | '
        f'refactoredCode empty={not rc.strip()} | '
        f'preview: {rc[:60]!r}'
    )